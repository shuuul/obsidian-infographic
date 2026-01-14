import {Editor, MarkdownView, Notice, Plugin} from "obsidian";
import {DEFAULT_SETTINGS, InfographicSettings, InfographicSettingTab} from "./settings";
import {parseInfographicSpec, showParseError} from "./parser";
import {InfographicRenderChild} from "./renderer";
import {SourceCodeModal, ExportModal} from "./ui";

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

		this.registerMarkdownCodeBlockProcessor("infographic", (source, el, ctx) => {
			this.processInfographicBlock(source, el, ctx);
		});

		this.addSettingTab(new InfographicSettingTab(this.app, this));

		this.registerCommands();
		this.registerEventHandlers();
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
			id: "insert-infographic-template",
			name: "Insert infographic template",
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
			id: "refresh-infographics",
			name: "Refresh infographics in current note",
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
		return document.body.classList.contains("theme-dark");
	}

	private processInfographicBlock(
		source: string,
		el: HTMLElement,
		ctx: import("obsidian").MarkdownPostProcessorContext
	): void {
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

		const container = el.createDiv({cls: "infographic-wrapper"});

		const renderContainer = container.createDiv({cls: "infographic-render"});
		const renderChild = new InfographicRenderChild(renderContainer, {
			content: result.content,
			isJson: result.isJson,
			maxWidth: this.settings.maxWidth,
			maxHeight: this.settings.maxHeight,
			theme: this.settings.theme,
			isDarkMode: this.isDarkMode(),
		});
		ctx.addChild(renderChild);

		// Always show toolbar with Copy and Export buttons
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

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<InfographicSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
