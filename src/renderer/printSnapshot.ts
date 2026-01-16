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
	// Some serializers omit xmlns, which can break data-url rendering.
	if (!svgEl.getAttribute("xmlns")) {
		svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	}
}

function svgToDataUrl(svgEl: SVGSVGElement): string {
	ensureSvgNamespace(svgEl);
	const serialized = new XMLSerializer().serializeToString(svgEl);
	// Encode for data-url. encodeURIComponent is generally safe for SVG text.
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
}

function canvasToDataUrl(canvasEl: HTMLCanvasElement): string | null {
	try {
		return canvasEl.toDataURL("image/png");
	} catch {
		// SecurityError or other canvas export failures (tainted canvas, etc.)
		return null;
	}
}

export function refreshInfographicPrintSnapshot(wrapperEl: HTMLElement, app?: App, cacheDir?: string): void {
	const liveEl = wrapperEl.querySelector<HTMLElement>(".infographic-render");
	const printEl = wrapperEl.querySelector<HTMLElement>(".infographic-print");
	if (!liveEl || !printEl) return;

	// Prefer the AntV-generated snapshot (if present). It's generally more reliable than DOM serialization.
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
		// Best-effort: persist to vault-backed resource URL (more reliable for PDF export in Electron).
		if (app && cacheDir) {
			void persistSnapshotDataUrl(app, cacheDir, url, "svg", `dom|svg|${url}`).then((src) => {
				img.setAttribute("src", src);
			}).catch(() => {
				// ignore
			});
		}
		return;
	}

	const canvas = liveEl.querySelector<HTMLCanvasElement>("canvas");
	if (canvas) {
		const url = canvasToDataUrl(canvas);
		printEl.empty();
		if (!url) return;
		const img = printEl.createEl("img", { cls: "infographic-print-img" });
		img.dataset.source = "dom";
		img.setAttribute("src", url);
		img.setAttribute("alt", "Infographic");
		wrapperEl.addClass("infographic-has-print");
		if (app && cacheDir) {
			void persistSnapshotDataUrl(app, cacheDir, url, "png", `dom|png|${url}`).then((src) => {
				img.setAttribute("src", src);
			}).catch(() => {
				// ignore
			});
		}
	}
}

export function refreshAllInfographicPrintSnapshots(root: ParentNode = document, app?: App, cacheDir?: string): void {
	const wrappers = root.querySelectorAll<HTMLElement>(".infographic-wrapper");
	wrappers.forEach((wrapper) => refreshInfographicPrintSnapshot(wrapper, app, cacheDir));
}

/**
 * Render a static snapshot of an infographic for PDF export mode.
 * This creates a temporary off-screen infographic, captures it as an image,
 * and populates the print container with the static image.
 * 
 * Used when isPrinting is true to ensure the image is available before
 * Obsidian captures the DOM for PDF export.
 */
export async function renderStaticSnapshot(
	app: App,
	cacheDir: string,
	content: string,
	isJson: boolean,
	theme: string,
	printEl: HTMLElement,
	wrapperEl: HTMLElement
): Promise<void> {
	// Create a temporary off-screen container for rendering
	const tempContainer = document.createElement("div");
	tempContainer.addClass("infographic-offscreen-render");
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

		// Wait a frame for rendering to complete
		await new Promise((resolve) => requestAnimationFrame(resolve));

		const keyBase = `${theme}|${isJson ? "json" : "dsl"}|${content}`;

		// Try PNG first (more reliable for PDF)
		try {
			const dataUrl = await infographic.toDataURL({ type: "png" });
			if (dataUrl) {
				const src = await persistSnapshotDataUrl(app, cacheDir, dataUrl, "png", `${keyBase}|png`);
				setStaticImage(printEl, wrapperEl, src);
				return;
			}
		} catch {
			// Fall back to SVG
		}

		// Try SVG as fallback
		try {
			const dataUrl = await infographic.toDataURL({ type: "svg" });
			if (dataUrl) {
				const src = await persistSnapshotDataUrl(app, cacheDir, dataUrl, "svg", `${keyBase}|svg`);
				setStaticImage(printEl, wrapperEl, src);
				return;
			}
		} catch {
			// If all fails, try DOM-based extraction
		}

		// DOM-based SVG extraction as last resort
		const svg = tempContainer.querySelector<SVGSVGElement>("svg");
		if (svg) {
			ensureSvgNamespace(svg);
			const serialized = new XMLSerializer().serializeToString(svg);
			const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
			const src = await persistSnapshotDataUrl(app, cacheDir, dataUrl, "svg", `${keyBase}|dom|svg`);
			setStaticImage(printEl, wrapperEl, src);
		}
	} catch (e) {
		console.error("[Infographic Plugin] Failed to render static snapshot for PDF:", e);
	} finally {
		// Cleanup
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

function setStaticImage(printEl: HTMLElement, wrapperEl: HTMLElement, src: string): void {
	printEl.empty();
	const img = printEl.createEl("img", { cls: "infographic-print-img" });
	img.dataset.source = "static";
	img.setAttribute("src", src);
	img.setAttribute("alt", "Infographic");
	wrapperEl.addClass("infographic-has-print");
}

