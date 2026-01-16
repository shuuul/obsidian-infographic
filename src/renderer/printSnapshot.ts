import type {App} from "obsidian";
import {Infographic, type InfographicOptions} from "@antv/infographic";
import {persistSnapshotDataUrl} from "./snapshotFileCache";

interface ParsedInfographicConfig {
	width?: number;
	height?: number;
	theme?: string;
	template?: string;
	data?: InfographicOptions["data"];
}

function ensureSvgNamespace(svgEl: SVGSVGElement): void {
	if (!svgEl.getAttribute("xmlns")) {
		svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	}
}

function svgToDataUrl(svgEl: SVGSVGElement): string {
	ensureSvgNamespace(svgEl);
	const serialized = new XMLSerializer().serializeToString(svgEl);
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
}

function canvasToDataUrl(canvasEl: HTMLCanvasElement): string | null {
	try {
		return canvasEl.toDataURL("image/png");
	} catch {
		return null;
	}
}

/**
 * Refresh print snapshot from the live DOM (SVG or canvas).
 * Used as a fallback when AntV export is not available.
 */
export function refreshInfographicPrintSnapshot(wrapperEl: HTMLElement, app?: App, cacheDir?: string): void {
	const liveEl = wrapperEl.querySelector<HTMLElement>(".infographic-render");
	const printEl = wrapperEl.querySelector<HTMLElement>(".infographic-print");
	if (!liveEl || !printEl) return;

	// Skip if we already have an AntV-generated snapshot
	const antvImg = printEl.querySelector<HTMLImageElement>('img[data-source="antv"]');
	if (antvImg?.getAttribute("src")) return;

	const svg = liveEl.querySelector<SVGSVGElement>("svg");
	if (svg) {
		const url = svgToDataUrl(svg);
		printEl.empty();
		const img = printEl.createEl("img", { cls: "infographic-print-img" });
		img.dataset.source = "dom";
		img.setAttribute("src", url);
		img.setAttribute("alt", "Infographic");
		wrapperEl.addClass("infographic-has-print");
		if (app && cacheDir) {
			void persistSnapshotDataUrl(app, cacheDir, url, "svg", `dom|svg|${url}`).then((src) => {
				img.dataset.persistedSrc = src;
			}).catch(() => {});
		}
		return;
	}

	const canvas = liveEl.querySelector<HTMLCanvasElement>("canvas");
	if (canvas) {
		const url = canvasToDataUrl(canvas);
		if (!url) return;
		printEl.empty();
		const img = printEl.createEl("img", { cls: "infographic-print-img" });
		img.dataset.source = "dom";
		img.setAttribute("src", url);
		img.setAttribute("alt", "Infographic");
		wrapperEl.addClass("infographic-has-print");
		if (app && cacheDir) {
			void persistSnapshotDataUrl(app, cacheDir, url, "png", `dom|png|${url}`).then((src) => {
				img.dataset.persistedSrc = src;
			}).catch(() => {});
		}
	}
}

/**
 * Refresh all print snapshots in the document.
 * Called on beforeprint event.
 */
export function refreshAllInfographicPrintSnapshots(root: ParentNode = document, app?: App, cacheDir?: string): void {
	const wrappers = root.querySelectorAll<HTMLElement>(".infographic-wrapper");
	wrappers.forEach((wrapper) => refreshInfographicPrintSnapshot(wrapper, app, cacheDir));
}

/**
 * Wait for multiple animation frames to ensure rendering completes.
 */
async function waitForRender(frames: number = 3): Promise<void> {
	for (let i = 0; i < frames; i++) {
		await new Promise((resolve) => requestAnimationFrame(resolve));
	}
	await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Render a static snapshot directly into an element for PDF export.
 * Creates an off-screen infographic, captures it as an image, and appends
 * the image to the target element. Uses data URLs for maximum compatibility.
 */
export async function renderStaticSnapshotDirect(
	app: App,
	cacheDir: string,
	content: string,
	isJson: boolean,
	theme: string,
	targetEl: HTMLElement
): Promise<void> {
	// Create off-screen container with clip-path (not visibility:hidden) so browsers render it
	const tempContainer = document.createElement("div");
	tempContainer.addClass("infographic-offscreen-render");
	tempContainer.style.cssText = `
		position: fixed;
		left: 0;
		top: 0;
		width: 800px;
		height: 600px;
		clip-path: inset(100%);
		pointer-events: none;
		z-index: -9999;
	`;
	document.body.appendChild(tempContainer);

	let infographic: Infographic | null = null;

	try {
		const width = 800;
		const height = 600;

		if (isJson) {
			const parsed = JSON.parse(content) as ParsedInfographicConfig;
			infographic = new Infographic({
				container: tempContainer,
				width: parsed.width ?? width,
				height: parsed.height ?? height,
				theme: parsed.theme ?? theme,
				...parsed,
			});
			infographic.render();
		} else {
			infographic = new Infographic({
				container: tempContainer,
				width,
				height,
				theme,
			});
			infographic.render(content);
		}

		await waitForRender(3);

		const keyBase = `${theme}|${isJson ? "json" : "dsl"}|${content}`;

		// Try PNG first, then SVG, then DOM extraction
		let dataUrl: string | null = null;
		try {
			dataUrl = await infographic.toDataURL({ type: "png" });
		} catch {
			// Try SVG fallback
		}

		if (!dataUrl) {
			try {
				dataUrl = await infographic.toDataURL({ type: "svg" });
			} catch {
				// Try DOM extraction
			}
		}

		if (!dataUrl) {
			const svg = tempContainer.querySelector<SVGSVGElement>("svg");
			if (svg) {
				ensureSvgNamespace(svg);
				const serialized = new XMLSerializer().serializeToString(svg);
				dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
			}
		}

		if (dataUrl) {
			const img = targetEl.createEl("img", { cls: "infographic-print-img" });
			img.setAttribute("src", dataUrl);
			img.setAttribute("alt", "Infographic");

			// Best-effort persistence for Electron reliability
			try {
				const ext = dataUrl.startsWith("data:image/png") ? "png" : "svg";
				const persisted = await persistSnapshotDataUrl(app, cacheDir, dataUrl, ext, `${keyBase}|${ext}`);
				img.dataset.persistedSrc = persisted;
			} catch {
				// Keep data URL
			}
		}
	} catch (e) {
		console.error("[Infographic Plugin] Failed to render static snapshot:", e);
	} finally {
		if (infographic) {
			try {
				infographic.destroy();
			} catch {
				// Ignore cleanup errors
			}
		}
		tempContainer.remove();
	}
}
