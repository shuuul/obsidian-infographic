import {MarkdownRenderChild} from "obsidian";
import {Infographic} from "@antv/infographic";

export class InfographicRenderChild extends MarkdownRenderChild {
	private infographic: Infographic | null = null;
	private content: string;
	private isJson: boolean;
	private maxWidth: number;
	private maxHeight: number;

	constructor(
		containerEl: HTMLElement,
		content: string,
		isJson: boolean,
		maxWidth: number,
		maxHeight: number
	) {
		super(containerEl);
		this.content = content;
		this.isJson = isJson;
		this.maxWidth = maxWidth;
		this.maxHeight = maxHeight;
	}

	onload(): void {
		this.render();
	}

	onunload(): void {
		this.destroy();
	}

	private render(): void {
		this.containerEl.empty();
		this.containerEl.addClass("infographic-container");

		try {
			if (this.isJson) {
				const options = JSON.parse(this.content);
				this.infographic = new Infographic({
					container: this.containerEl,
					width: options.width ?? this.maxWidth,
					height: options.height ?? this.maxHeight,
					...options,
				});
				this.infographic.render();
			} else {
				this.infographic = new Infographic({
					container: this.containerEl,
					width: this.maxWidth,
					height: this.maxHeight,
				});
				this.infographic.render(this.content);
			}
		} catch (e) {
			this.renderError(e instanceof Error ? e.message : String(e));
		}
	}

	private renderError(message: string): void {
		this.containerEl.empty();
		this.containerEl.addClass("infographic-error");
		
		const errorDiv = this.containerEl.createDiv({cls: "infographic-error-message"});
		errorDiv.setText(`Failed to render infographic: ${message}`);
	}

	private destroy(): void {
		if (this.infographic) {
			try {
				this.infographic.destroy();
			} catch {}
			this.infographic = null;
		}
	}
}
