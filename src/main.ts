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
	const match = fence.match(/^(`{3,})\s*infographic\b(.*)$/);
	if (!match) return fence;
	const rest = (match[2] ?? "").replace(/\s+width\s*=\s*\d+/i, "").trim();
	return `${match[1]} infographic${rest ? ` ${rest}` : ""} width=${width}`;
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

		const fenceWidth = this.parseFenceWidth(ctx, el);
		if (fenceWidth !== null) {
			container.style.width = `${fenceWidth}px`;
			container.addClass("infographic-has-width");
		}

		const renderContainer = container.createDiv({cls: "infographic-render"});
		// Print-only fallback snapshot container (populated with a static <img>).
		// Created but not stored - refreshInfographicPrintSnapshot queries for it.
		container.createDiv({cls: "infographic-print"});

		const renderChild = new InfographicRenderChild(renderContainer, {
			app: this.app,
			cacheDir,
			content: result.content,
			isJson: result.isJson,
			theme: this.settings.theme,
			isDarkMode: this.isDarkMode(),
			isPrinting: false,
			explicitWidth: fenceWidth ?? undefined,
			onWidthCommit: (width: number) => this.persistBlockWidth(ctx, el, width),
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

		// Always show toolbar with Copy and Export buttons (hidden in print via CSS)
		const toolbar = container.createDiv({cls: "infographic-toolbar"});
		
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
	 * Read a fence-level width override (```infographic width=N) from the
	 * section's first line. Returns null when absent or out of range.
	 */
	private parseFenceWidth(ctx: MarkdownPostProcessorContext, el: HTMLElement): number | null {
		const info = ctx.getSectionInfo(el);
		const fence = info?.text.split("\n")[0];
		if (!fence) return null;
		const match = fence.match(/\bwidth\s*=\s*(\d+)\b/i);
		if (!match) return null;
		const width = Number(match[1]);
		if (!Number.isFinite(width) || width < 200) return null;
		const available = el.clientWidth || width;
		return Math.min(width, available);
	}

	/**
	 * Best-effort persistence of a drag-resized width: rewrite the block's
	 * fence line in the live editor. Skipped in reading mode, in hover
	 * previews of other files, and when the section cannot be located
	 * unambiguously, so user content is never edited ambiguously.
	 */
	private persistBlockWidth(ctx: MarkdownPostProcessorContext, el: HTMLElement, width: number): void {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view || view.getMode() !== "source") return;
		const filePath = ctx.sourcePath.split("#")[0];
		if (!view.file || view.file.path !== filePath) return;
		const info = ctx.getSectionInfo(el);
		if (!info) return;
		const fence = info.text.split("\n")[0];
		if (!fence) return;
		const updatedFence = setFenceWidth(fence, width);
		if (updatedFence === fence) return;
		// Prefer the rendered-at line position, fall back to a unique text
		// match in case earlier edits shifted the section.
		const line = view.editor.getLine(info.lineStart) === fence
			? info.lineStart
			: findUniqueSectionStart(view.editor, info.text.split("\n"));
		if (line === null) return;
		view.editor.replaceRange(updatedFence, {line, ch: 0}, {line, ch: fence.length});
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<InfographicSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
