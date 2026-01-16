import type {App} from "obsidian";
import {MarkdownRenderChild} from "obsidian";
import {Infographic, type InfographicOptions} from "@antv/infographic";
import type {ThemeSetting} from "../settings";
import {persistSnapshotDataUrl} from "./snapshotFileCache";

export interface RenderOptions {
	app: App;
	cacheDir: string;
	content: string;
	isJson: boolean;
	theme: ThemeSetting;
	isDarkMode: boolean;
	/** True when Obsidian is in PDF export mode */
	isPrinting?: boolean;
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
	private snapshotRefreshTimer: number | null = null;
	private started: boolean = false;

	constructor(containerEl: HTMLElement, options: RenderOptions) {
		super(containerEl);
		this.options = options;
	}

	onload(): void {
		this.ensureStarted();
	}

	onunload(): void {
		this.cleanup();
	}

	getInfographic(): Infographic | null {
		return this.infographic;
	}

	/**
	 * Some Obsidian render pipelines (notably PDF export) may not invoke
	 * MarkdownRenderChild lifecycle hooks. This makes rendering idempotent and callable.
	 */
	ensureStarted(): void {
		if (this.started) return;
		this.started = true;
		this.showLoading();
		this.render();
		this.setupResizeObserver();
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
			this.schedulePrintSnapshotRefresh();
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
						this.schedulePrintSnapshotRefresh();
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
		if (this.snapshotRefreshTimer) {
			window.clearTimeout(this.snapshotRefreshTimer);
			this.snapshotRefreshTimer = null;
		}
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}
		this.destroyInfographic();
	}

	private getPrintContainerEl(): HTMLElement | null {
		const wrapper = this.containerEl.closest<HTMLElement>(".infographic-wrapper");
		return wrapper?.querySelector<HTMLElement>(".infographic-print") ?? null;
	}

	private setPrintSnapshot(dataUrl: string, source: "antv" | "dom", persisted?: string): void {
		const printEl = this.getPrintContainerEl();
		if (!printEl) return;
		const wrapper = this.containerEl.closest<HTMLElement>(".infographic-wrapper");
		wrapper?.addClass("infographic-has-print");
		printEl.empty();
		const img = printEl.createEl("img", { cls: "infographic-print-img" });
		img.dataset.source = source;
		// Keep data URL primary for maximum compatibility with PDF renderers.
		img.setAttribute("src", dataUrl);
		if (persisted) {
			img.dataset.persistedSrc = persisted;
		}
		img.setAttribute("alt", "Infographic");
	}

	private schedulePrintSnapshotRefresh(): void {
		if (this.snapshotRefreshTimer) window.clearTimeout(this.snapshotRefreshTimer);
		this.snapshotRefreshTimer = window.setTimeout(() => {
			this.snapshotRefreshTimer = null;
			void this.generatePrintSnapshot();
		}, 250);
	}

	private async generatePrintSnapshot(): Promise<void> {
		if (!this.infographic) return;
		const keyBase = `${this.getTheme() ?? ""}|${this.options.isJson ? "json" : "dsl"}|${this.options.content}`;
		// Prefer PNG for printing reliability.
		try {
			const dataUrl = await this.infographic.toDataURL({ type: "png" });
			if (dataUrl) {
				let persisted: string | undefined;
				try {
					persisted = await persistSnapshotDataUrl(this.options.app, this.options.cacheDir, dataUrl, "png", `${keyBase}|png`);
				} catch {
					// keep dataUrl only
				}
				this.setPrintSnapshot(dataUrl, "antv", persisted);
			}
			return;
		} catch {
			// Fall back to SVG data-url export.
		}

		try {
			const dataUrl = await this.infographic.toDataURL({ type: "svg" });
			if (dataUrl) {
				let persisted: string | undefined;
				try {
					persisted = await persistSnapshotDataUrl(this.options.app, this.options.cacheDir, dataUrl, "svg", `${keyBase}|svg`);
				} catch {
					// keep dataUrl only
				}
				this.setPrintSnapshot(dataUrl, "antv", persisted);
			}
		} catch {
			// If export fails, do nothing; the DOM snapshot fallback may still work via beforeprint.
		}
	}
}
