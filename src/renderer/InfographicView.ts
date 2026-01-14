import {MarkdownRenderChild} from "obsidian";
import {Infographic, type InfographicOptions} from "@antv/infographic";
import type {ThemeSetting} from "../settings";

export interface RenderOptions {
	content: string;
	isJson: boolean;
	maxWidth: number;
	maxHeight: number;
	theme: ThemeSetting;
	isDarkMode: boolean;
}

interface ParsedInfographicConfig {
	width?: number;
	height?: number;
	theme?: string;
	template?: string;
	data?: InfographicOptions["data"];
}

export class InfographicRenderChild extends MarkdownRenderChild {
	private infographic: Infographic | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private options: RenderOptions;
	private loadingEl: HTMLElement | null = null;

	constructor(containerEl: HTMLElement, options: RenderOptions) {
		super(containerEl);
		this.options = options;
	}

	onload(): void {
		this.showLoading();
		this.render();
		this.setupResizeObserver();
	}

	onunload(): void {
		this.cleanup();
	}

	getInfographic(): Infographic | null {
		return this.infographic;
	}

	private getTheme(): string | undefined {
		if (this.options.theme === "auto") {
			return this.options.isDarkMode ? "dark" : "light";
		}
		return this.options.theme;
	}

	private showLoading(): void {
		this.containerEl.empty();
		this.containerEl.addClass("infographic-container");
		this.loadingEl = this.containerEl.createDiv({cls: "infographic-loading"});
		this.loadingEl.setText("Loading infographic...");
	}

	private hideLoading(): void {
		if (this.loadingEl) {
			this.loadingEl.remove();
			this.loadingEl = null;
		}
	}

	private render(): void {
		const theme = this.getTheme();

		try {
			if (this.options.isJson) {
				const parsed = JSON.parse(this.options.content) as ParsedInfographicConfig;
				this.infographic = new Infographic({
					container: this.containerEl,
					width: parsed.width ?? this.options.maxWidth,
					height: parsed.height ?? this.options.maxHeight,
					theme: parsed.theme ?? theme,
					...parsed,
				});
				this.infographic.render();
			} else {
				this.infographic = new Infographic({
					container: this.containerEl,
					width: this.options.maxWidth,
					height: this.options.maxHeight,
					theme,
				});
				this.infographic.render(this.options.content);
			}
			this.hideLoading();
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			console.error("[Infographic Plugin] Render error:", message, {
				content: this.options.content.substring(0, 200),
				isJson: this.options.isJson,
			});
			this.hideLoading();
			this.renderError(message);
		}
	}

	private setupResizeObserver(): void {
		if (typeof ResizeObserver === "undefined") return;

		this.resizeObserver = new ResizeObserver(() => {
			if (this.infographic && this.containerEl.isConnected) {
				this.rerender();
			}
		});
		
		this.resizeObserver.observe(this.containerEl.parentElement ?? this.containerEl);
	}

	private rerender(): void {
		this.destroyInfographic();
		this.render();
	}

	private renderError(message: string): void {
		this.containerEl.empty();
		this.containerEl.addClass("infographic-error");
		
		const errorDiv = this.containerEl.createDiv({cls: "infographic-error-message"});
		errorDiv.setText(`Failed to render infographic: ${message}`);
	}

	private destroyInfographic(): void {
		if (this.infographic) {
			try {
				this.infographic.destroy();
			} catch {
				// AntV Infographic may throw during cleanup if already destroyed
			}
			this.infographic = null;
		}
	}

	private cleanup(): void {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		this.destroyInfographic();
	}
}
