import {Plugin} from "obsidian";
import {DEFAULT_SETTINGS, InfographicSettings, InfographicSettingTab} from "./settings";
import {parseInfographicSpec, showParseError} from "./parser";
import {InfographicRenderChild} from "./renderer";
import {SourceCodeModal} from "./ui";

export default class InfographicPlugin extends Plugin {
	settings: InfographicSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("infographic", (source, el, ctx) => {
			this.processInfographicBlock(source, el, ctx);
		});

		this.addSettingTab(new InfographicSettingTab(this.app, this));
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
			showParseError(result.error);
			this.renderErrorBlock(el, result.error, source);
			return;
		}

		const container = el.createDiv({cls: "infographic-wrapper"});

		if (this.settings.showSourceButton) {
			const toolbar = container.createDiv({cls: "infographic-toolbar"});
			const sourceBtn = toolbar.createEl("button", {
				text: "View source",
				cls: "infographic-source-btn",
			});
			sourceBtn.addEventListener("click", () => {
				new SourceCodeModal(this.app, source).open();
			});
		}

		const renderContainer = container.createDiv({cls: "infographic-render"});
		const renderChild = new InfographicRenderChild(
			renderContainer,
			result.content,
			result.isJson,
			this.settings.maxWidth,
			this.settings.maxHeight
		);
		ctx.addChild(renderChild);
	}

	private renderErrorBlock(el: HTMLElement, error: string, source: string): void {
		el.empty();
		el.addClass("infographic-error-block");
		
		const errorMsg = el.createDiv({cls: "infographic-error-header"});
		errorMsg.setText(`Error: ${error}`);

		const pre = el.createEl("pre", {cls: "infographic-error-source"});
		const code = pre.createEl("code");
		code.setText(source);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<InfographicSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
