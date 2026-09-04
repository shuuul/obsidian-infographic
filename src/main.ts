import {Editor, MarkdownPostProcessorContext, MarkdownView, Notice, Plugin} from "obsidian";
import {DEFAULT_SETTINGS, InfographicSettings, InfographicSettingTab} from "./settings";
import {parseInfographicSpec, showParseError} from "./parser";
import {InfographicRenderChild} from "./renderer";
import {refreshAllInfographicPrintSnapshots, refreshInfographicPrintSnapshot, renderStaticSnapshotDirect} from "./renderer/printSnapshot";
import {SourceCodeModal, ExportModal} from "./ui";

/**
 * Detect if Obsidian is in PDF export mode.
 * Obsidian renders PDF export inside a container with `.print` class on body or as a direct child.
 * This mirrors the detection pattern used by obsidian-excalidraw-plugin.
 */
function isPrintingMode(doc: Document): boolean {
	return Boolean(doc.body.querySelectorAll("body > .print").length > 0) ||
		doc.body.classList.contains("print");
}

/**
 * Rewrite an ```infographic fence line so it carries `width=N`, preserving
 * any other fence parameters.
 */
function setFenceWidth(fence: string, width: number): string {
	const match = fence.match(/^(`{3,})(\s*)infographic\b(.*)$/);
	if (!match) return fence;
	const sep = match[2] ?? " ";
	const rest = (match[3] ?? "").replace(/\s+width\s*=\s*\d+/i, "").trim();
	return `${match[1]}${sep}infographic${rest ? ` ${rest}` : ""} width=${width}`;
}

/**
 * Set or remove the `align=center|left` parameter on an ```infographic fence
 * line, preserving every other parameter. `null` removes the parameter so the
 * plugin default applies again.
 */
function setFenceAlign(fence: string, align: "center" | "left" | null): string {
	const match = fence.match(/^(`{3,})(\s*)infographic\b(.*)$/);
	if (!match) return fence;
	const sep = match[2] ?? " ";
	const rest = (match[3] ?? "").replace(/\s+align\s*=\s*(center|left)\b/i, "").trim();
	if (!align) return `${match[1]}${sep}infographic${rest ? ` ${rest}` : ""}`;
	return `${match[1]}${sep}infographic${rest ? ` ${rest}` : ""} align=${align}`;
}

/**
 * Read the `align=center|left` parameter from a fence line.
 * Returns null when absent (the plugin default applies).
 */
function getFenceAlign(fence: string): "center" | "left" | null {
	const match = fence.match(/\balign\s*=\s*(center|left)\b/);
	return match ? (match[1] as "center" | "left") : null;
}

/** True when the line opens an infographic code fence. */
function isInfographicFence(line: string): boolean {
	return /^\s*`{3,}\s*infographic\b/.test(line);
}

/** Parse the `width=N` fence parameter. Returns null when absent or too small. */
function parseWidthParam(fence: string): number | null {
	const match = fence.match(/\bwidth\s*=\s*(\d+)\b/i);
	if (!match) return null;
	const width = Number(match[1]);
	return Number.isFinite(width) && width >= 200 ? width : null;
}

/**
 * Locate the section inside the editor by matching its lines. Returns the
 * fence line number only when exactly one match exists, so ambiguous blocks
 * are never edited.
 */
function findUniqueSectionStart(editor: Editor, section: string[]): number | null {
	const first = section[0];
	if (first === undefined) return null;
	const last = section.length - 1;
	let found: number | null = null;
	let matches = 0;
	for (let line = 0; line + last <= editor.lastLine(); line++) {
		if (editor.getLine(line) !== first) continue;
		let ok = true;
		for (let offset = 1; offset <= last; offset++) {
			if (editor.getLine(line + offset) !== section[offset]) {
				ok = false;
				break;
			}
		}
		if (ok) {
			matches++;
			found = line;
		}
	}
	return matches === 1 ? found : null;
}

/**
 * Locate a code block in the editor by matching its fence line against the
 * block's rendered source. Returns the fence line number and text only when
 * exactly one match exists. Used as the live-preview fallback where
 * ctx.getSectionInfo is unavailable.
 */
function findUniqueBlockFence(editor: Editor, source: string): {line: number, fence: string} | null {
	const contentLines = source.split("\n");
	const last = contentLines.length - 1;
	let found: {line: number, fence: string} | null = null;
	let matches = 0;
	for (let line = 0; line + 1 + last <= editor.lastLine(); line++) {
		const fence = editor.getLine(line);
		if (!/^\s*`{3,}\s*infographic\b/.test(fence)) continue;
		let ok = true;
		for (let offset = 0; offset <= last; offset++) {
			const expected = contentLines[offset];
			if (expected !== undefined && editor.getLine(line + 1 + offset) !== expected) {
				ok = false;
				break;
			}
		}
		if (ok) {
			matches++;
			if (found === null) found = {line, fence};
		}
	}
	return matches === 1 ? found : null;
}

declare const activeWindow: Window;

const INFOGRAPHIC_TEMPLATE = `{
  "template": "list-row-simple-horizontal-arrow",
  "data": {
    "items": [
      { "label": "Step 1", "desc": "Description" },
      { "label": "Step 2", "desc": "Description" },
      { "label": "Step 3", "desc": "Description" }
    ]
  }
}`;

export default class InfographicPlugin extends Plugin {
	settings: InfographicSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Use async callback to properly await image generation during PDF export
		this.registerMarkdownCodeBlockProcessor("infographic", async (source, el, ctx) => {
			await this.processInfographicBlock(source, el, ctx);
		});

		this.addSettingTab(new InfographicSettingTab(this.app, this));

		this.registerCommands();
		this.registerEventHandlers();

		// Ensure PDF export (print pipeline) uses a static snapshot instead of live rendering.
		const activeDoc = activeWindow.document;
		this.registerDomEvent(activeWindow, "beforeprint", () => {
			refreshAllInfographicPrintSnapshots(activeDoc, this.app, `${this.manifest.dir}/print-cache`);
		});
	}

	private registerEventHandlers(): void {
		// Refresh infographics when switching to a different note
		this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
			if (leaf) {
				const view = leaf.view;
				if (view instanceof MarkdownView) {
					this.refreshView(view);
				}
			}
		}));
	}

	private refreshView(view: MarkdownView): void {
		// Force re-render by updating view state
		const state = view.getState();
		void view.setState(state, {history: false});
	}

		private registerCommands(): void {
		this.addCommand({
			id: "insert-template",
			name: "Insert template",
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				const template = "```infographic\n" + INFOGRAPHIC_TEMPLATE + "\n```\n";
				editor.replaceRange(template, cursor);
				editor.setCursor({
					line: cursor.line + 2,
					ch: 0,
				});
			},
		});

		this.addCommand({
			id: "refresh-all",
			name: "Refresh in current note",
			checkCallback: (checking: boolean) => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (!view) return false;
				if (checking) return true;

				// Force re-render by triggering a view mode refresh
				const state = view.getState();
				void view.setState(state, {history: false});
				return true;
			},
		});
	}

	private isDarkMode(): boolean {
		return activeWindow.document.body.classList.contains("theme-dark");
	}

	private async processInfographicBlock(
		source: string,
		el: HTMLElement,
		ctx: import("obsidian").MarkdownPostProcessorContext
	): Promise<void> {
		if (!this.settings.autoRender) {
			return;
		}

		const result = parseInfographicSpec(source);

		if (!result.success) {
			console.error("[Infographic Plugin] Parse error:", result.error, {
				source: source.substring(0, 200),
			});
			showParseError(result.error);
			this.handleError(el, result.error, source);
			return;
		}

		const cacheDir = `${this.manifest.dir}/print-cache`;
		const activeDoc = activeWindow.document;
		const isPrinting = isPrintingMode(activeDoc);
		const theme = this.settings.theme === "auto" ? (this.isDarkMode() ? "dark" : "light") : this.settings.theme;

		// In PDF export mode, render a static image DIRECTLY to the element.
		// This matches Excalidraw's approach: empty the container and append an <img> directly.
		// No wrapper/CSS swapping needed - the image is simply there in the DOM.
		if (isPrinting) {
			el.empty();
			el.addClass("infographic-print-container");
			// Await the static image generation for PDF export.
			await renderStaticSnapshotDirect(
				this.app,
				cacheDir,
				result.content,
				result.isJson,
				theme,
				el
			);
			return;
		}

		// Normal (non-PDF) mode: create wrapper with live renderer
		const container = el.createDiv({cls: "infographic-wrapper"});

		const fence = this.resolveFenceText(ctx, el, source);
		const fenceWidth = fence ? parseWidthParam(fence) : null;
		if (fenceWidth !== null) {
			const available = el.clientWidth || fenceWidth;
			container.style.width = `${Math.min(fenceWidth, available)}px`;
			container.addClass("infographic-has-width");
		}
		const fenceAlign = fence ? getFenceAlign(fence) : null;
		let centered = fenceAlign !== null ? fenceAlign === "center" : this.settings.centerByDefault;
		container.toggleClass("infographic-centered", centered);
		// Print-only fallback snapshot container (populated with a static <img>).
		// Created but not stored - refreshInfographicPrintSnapshot queries for it.
		container.createDiv({cls: "infographic-print"});

		const renderContainer = container.createDiv({cls: "infographic-render"});

		const renderChild = new InfographicRenderChild(renderContainer, {
			app: this.app,
			cacheDir,
			content: result.content,
			isJson: result.isJson,
			theme: this.settings.theme,
			isDarkMode: this.isDarkMode(),
			isPrinting: false,
			explicitWidth: fenceWidth ?? undefined,
			onWidthCommit: (width: number) => this.persistBlockWidth(ctx, el, source, width),
		});
		ctx.addChild(renderChild);
		// Ensure rendering even in pipelines that don't call MarkdownRenderChild.onload (e.g. PDF export).
		renderChild.ensureStarted();

		// Populate print snapshot after the live render has had a chance to paint.
		window.requestAnimationFrame(() => refreshInfographicPrintSnapshot(container, this.app, cacheDir));

		// Force-generate a static snapshot into the print container so that PDF export
		// always has a ready <img>, even if .print detection fails or happens late.
		const printEl = container.querySelector<HTMLElement>(".infographic-print");
		if (printEl) {
			void renderStaticSnapshotDirect(
				this.app,
				cacheDir,
				result.content,
				result.isJson,
				theme,
				printEl
			);
		}

		// Always show toolbar with Center, Copy and Export buttons (hidden in print via CSS)
		const toolbar = container.createDiv({cls: "infographic-toolbar"});

		const centerBtn = toolbar.createEl("button", {
			text: "Center",
			cls: "infographic-toolbar-btn infographic-center-btn",
		});
		centerBtn.setAttribute("aria-pressed", String(centered));
		centerBtn.toggleClass("infographic-center-btn-active", centered);
		centerBtn.addEventListener("click", () => {
			centered = !centered;
			container.toggleClass("infographic-centered", centered);
			centerBtn.toggleClass("infographic-center-btn-active", centered);
			centerBtn.setAttribute("aria-pressed", String(centered));
			// Persist an explicit align so the block keeps its state even when
			// it differs from the centerByDefault setting.
			const align: "center" | "left" | null = centered
				? "center"
				: (this.settings.centerByDefault ? "left" : null);
			this.persistFenceUpdate(ctx, el, source, (fence) => setFenceAlign(fence, align));
		});

		const copyBtn = toolbar.createEl("button", {
			text: "Copy",
			cls: "infographic-toolbar-btn",
		});
		copyBtn.addEventListener("click", () => {
			navigator.clipboard.writeText(source.trim()).then(() => {
				new Notice("Copied to clipboard");
			}).catch(() => {
				new Notice("Failed to copy");
			});
		});

		const exportBtn = toolbar.createEl("button", {
			text: "Export",
			cls: "infographic-toolbar-btn",
		});
		exportBtn.addEventListener("click", () => {
				const infographic = renderChild.getInfographic();
				if (infographic) {
					new ExportModal(this.app, infographic).open();
				}
			});
	}

	private handleError(el: HTMLElement, error: string, source: string): void {
		switch (this.settings.errorBehavior) {
			case "hide":
				el.empty();
				el.addClass("infographic-hidden");
				break;
			case "show-error": {
				el.empty();
				el.addClass("infographic-error-block");
				const errorMsg = el.createDiv({cls: "infographic-error-header"});
				errorMsg.setText(`Error: ${error}`);
				const detailsBtn = el.createEl("button", {
					text: "View details",
					cls: "infographic-error-details-btn",
				});
				detailsBtn.addEventListener("click", () => {
					new SourceCodeModal(this.app, source).open();
				});
				break;
			}
			case "show-code":
			default: {
				el.empty();
				el.addClass("infographic-error-block");
				const errorHeader = el.createDiv({cls: "infographic-error-header"});
				errorHeader.setText(`Error: ${error}`);
				const pre = el.createEl("pre", {cls: "infographic-error-source"});
				const code = pre.createEl("code");
				code.setText(source);
				break;
			}
		}
	}

	/**
	 * Resolve the block's fence line text. ctx.getSectionInfo is preferred,
	 * but in live preview it may describe an unrelated section, so anything
	 * that is not an infographic fence falls back to locating the block in
	 * the editor by its content.
	 */
	private resolveFenceText(ctx: MarkdownPostProcessorContext, el: HTMLElement, source: string): string | null {
		const info = ctx.getSectionInfo(el);
		const sectionFence = info?.text.split("\n")[0];
		if (sectionFence && isInfographicFence(sectionFence)) return sectionFence;

		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || view.getMode() !== "source") return null;
		if (!view.file || view.file.path !== ctx.sourcePath.split("#")[0]) return null;
		const located = findUniqueBlockFence(view.editor, source);
		return located?.fence ?? null;
	}

	/**
	 * Best-effort persistence of a fence edit (width / align): rewrite the
	 * block's fence line in the live editor. Skipped in reading mode, in
	 * hover previews of other files, and when the section cannot be located
	 * unambiguously, so user content is never edited ambiguously.
	 */
	private persistFenceUpdate(ctx: MarkdownPostProcessorContext, el: HTMLElement, source: string, update: (fence: string) => string): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || view.getMode() !== "source") return;
		const filePath = ctx.sourcePath.split("#")[0];
		if (!view.file || view.file.path !== filePath) return;
		const editor = view.editor;

		// Preferred: the section information captured while rendering.
		// CAVEAT: in live preview this may describe an unrelated section
		// (e.g. the surrounding heading), so only trust it when it actually
		// is an infographic fence.
		const info = ctx.getSectionInfo(el);
		if (info) {
			const fence = info.text.split("\n")[0];
			if (fence && isInfographicFence(fence)) {
				const updatedFence = update(fence);
				if (updatedFence === fence) return;
				const line = editor.getLine(info.lineStart) === fence
					? info.lineStart
					: findUniqueSectionStart(editor, info.text.split("\n"));
				if (line !== null) {
					editor.replaceRange(updatedFence, {line, ch: 0}, {line, ch: fence.length});
					return;
				}
			}
			// Stale or unrelated section info: fall through to content matching.
		}

		// Live preview fallback: ctx.getSectionInfo is unavailable inside
		// CodeMirror widgets, so locate the block by its fence + content.
		const located = findUniqueBlockFence(editor, source);
		if (!located) return;
		const updatedFence = update(located.fence);
		if (updatedFence === located.fence) return;
		editor.replaceRange(updatedFence, {line: located.line, ch: 0}, {line: located.line, ch: located.fence.length});
	}

	private persistBlockWidth(ctx: MarkdownPostProcessorContext, el: HTMLElement, source: string, width: number): void {
		this.persistFenceUpdate(ctx, el, source, (fence) => setFenceWidth(fence, width));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<InfographicSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
