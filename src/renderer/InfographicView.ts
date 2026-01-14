import {MarkdownRenderChild} from "obsidian";
import {Infographic, type InfographicOptions} from "@antv/infographic";
import type {ThemeSetting} from "../settings";

export interface RenderOptions {
	content: string;
	isJson: boolean;
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

const DEFAULT_ASPECT_RATIO = 4 / 3;

export class InfographicRenderChild extends MarkdownRenderChild {
	private infographic: Infographic | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private options: RenderOptions;
	private loadingEl: HTMLElement | null = null;
	private aspectRatio: number = DEFAULT_ASPECT_RATIO;

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
		const containerWidth = this.containerEl.parentElement?.clientWidth ?? 800;
		const width = containerWidth;
		const height = width / DEFAULT_ASPECT_RATIO;

		try {
			if (this.options.isJson) {
				const parsed = JSON.parse(this.options.content) as ParsedInfographicConfig;
				this.infographic = new Infographic({
					container: this.containerEl,
					width: parsed.width ?? width,
					height: parsed.height ?? height,
					theme: parsed.theme ?? theme,
					...parsed,
				});
				this.infographic.render();
			} else {
				this.infographic = new Infographic({
					container: this.containerEl,
					width,
					height,
					theme,
				});
				this.infographic.render(this.options.content);
			}
			this.hideLoading();
			this.updateAspectRatioFromSVG();
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

		this.resizeObserver = new ResizeObserver((entries) => {
			if (this.infographic && this.containerEl.isConnected) {
				for (const entry of entries) {
					const { width } = entry.contentRect;
					if (width > 0) {
						const height = width / this.aspectRatio;
						this.infographic.update({ width, height });
					}
				}
			}
		});
		
		this.resizeObserver.observe(this.containerEl.parentElement ?? this.containerEl);
	}

	private renderError(message: string): void {
		this.containerEl.empty();
		this.containerEl.addClass("infographic-error");
		
		const errorDiv = this.containerEl.createDiv({cls: "infographic-error-message"});
		errorDiv.setText(`Failed to render infographic: ${message}`);
	}

	private updateAspectRatioFromSVG(): void {
		if (!this.infographic) return;
		
		const svg = this.containerEl.querySelector("svg");
		if (!svg) return;

		const viewBox = svg.getAttribute("viewBox");
		if (viewBox) {
			const parts = viewBox.split(/\s+/).map(Number);
			const vbWidth = parts[2];
			const vbHeight = parts[3];
			if (parts.length === 4 && vbWidth !== undefined && vbHeight !== undefined && vbWidth > 0 && vbHeight > 0) {
				this.aspectRatio = vbWidth / vbHeight;
				this.resizeToFit();
				return;
			}
		}

		const rect = svg.getBoundingClientRect();
		if (rect.width > 0 && rect.height > 0) {
			this.aspectRatio = rect.width / rect.height;
			this.resizeToFit();
		}
	}

	private resizeToFit(): void {
		if (!this.infographic) return;
		
		const containerWidth = this.containerEl.parentElement?.clientWidth ?? 800;
		const width = containerWidth;
		const height = width / this.aspectRatio;
		this.infographic.update({ width, height });
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
