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
	// Create a temporary container for rendering.
	// Use clip-path instead of visibility:hidden to ensure the browser actually renders the content.
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

		// Wait multiple frames for rendering to complete.
		await waitForRender(3);

		const keyBase = `${theme}|${isJson ? "json" : "dsl"}|${content}`;
		const persistOptions = (ext: "png" | "svg") => ({
			app,
			cacheDir,
			ext,
			cacheKey: `${keyBase}|${ext}`,
		});

		// Try PNG first (more reliable for PDF)
		try {
			const dataUrl = await infographic.toDataURL({ type: "png" });
			if (dataUrl) {
				await setStaticImage(printEl, wrapperEl, dataUrl, persistOptions("png"));
				return;
			}
		} catch (e) {
			console.debug("[Infographic Plugin] PNG export failed, trying SVG:", e);
		}

		// Try SVG as fallback
		try {
			const dataUrl = await infographic.toDataURL({ type: "svg" });
			if (dataUrl) {
				await setStaticImage(printEl, wrapperEl, dataUrl, persistOptions("svg"));
				return;
			}
		} catch (e) {
			console.debug("[Infographic Plugin] SVG export failed, trying DOM extraction:", e);
		}

		// DOM-based SVG extraction as last resort
		const svg = tempContainer.querySelector<SVGSVGElement>("svg");
		if (svg) {
			ensureSvgNamespace(svg);
			const serialized = new XMLSerializer().serializeToString(svg);
			const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
			await setStaticImage(printEl, wrapperEl, dataUrl, {
				app,
				cacheDir,
				ext: "svg",
				cacheKey: `${keyBase}|dom|svg`,
			});
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

interface PersistOptions {
	app: App;
	cacheDir: string;
	ext: "png" | "svg";
	cacheKey: string;
}

async function setStaticImage(
	printEl: HTMLElement,
	wrapperEl: HTMLElement,
	src: string,
	persist?: PersistOptions
): Promise<void> {
	printEl.empty();
	const img = printEl.createEl("img", { cls: "infographic-print-img" });
	img.dataset.source = "static";
	img.setAttribute("src", src);
	img.setAttribute("alt", "Infographic");
	wrapperEl.addClass("infographic-has-print");

	// Try to persist to vault-backed resource; fall back to in-memory data URL on failure.
	if (persist) {
		try {
			const persisted = await persistSnapshotDataUrl(
				persist.app,
				persist.cacheDir,
				src,
				persist.ext,
				persist.cacheKey
			);
			img.setAttribute("src", persisted);
		} catch {
			// keep the original data URL
		}
	}
}

/**
 * Wait for multiple animation frames to ensure rendering completes.
 * Some complex infographics need more than one frame to fully render.
 */
async function waitForRender(frames: number = 3): Promise<void> {
	for (let i = 0; i < frames; i++) {
		await new Promise((resolve) => requestAnimationFrame(resolve));
	}
	// Additional small delay to ensure canvas/SVG operations complete
	await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Render a static snapshot DIRECTLY to an element for PDF export.
 * This matches Excalidraw's approach: render image directly into the element.
 * No wrapper/CSS swapping - the image is simply appended to the DOM.
 * 
 * This is the preferred method for PDF export as it ensures the image
 * is present in the DOM when Obsidian captures it for PDF generation.
 */
export async function renderStaticSnapshotDirect(
	app: App,
	cacheDir: string,
	content: string,
	isJson: boolean,
	theme: string,
	targetEl: HTMLElement
): Promise<void> {
	// Create a temporary container for rendering.
	// Use clip-path instead of visibility:hidden to ensure the browser actually renders the content.
	// Some browsers skip rendering for hidden elements, which breaks toDataURL().
	const tempContainer = document.createElement("div");
	tempContainer.addClass("infographic-offscreen-render");
	// Override CSS to use clip instead of visibility for better rendering compatibility
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

		// Wait multiple frames for rendering to complete.
		// AntV infographics may need several frames to fully render complex charts.
		await waitForRender(3);

		const keyBase = `${theme}|${isJson ? "json" : "dsl"}|${content}`;

		// Try PNG first (more reliable for PDF)
		let dataUrl: string | null = null;
		try {
			dataUrl = await infographic.toDataURL({ type: "png" });
		} catch (e) {
			console.debug("[Infographic Plugin] PNG export failed, trying SVG:", e);
		}

		// Try SVG as fallback
		if (!dataUrl) {
			try {
				dataUrl = await infographic.toDataURL({ type: "svg" });
			} catch (e) {
				console.debug("[Infographic Plugin] SVG export failed, trying DOM extraction:", e);
			}
		}

		// DOM-based SVG extraction as last resort
		if (!dataUrl) {
			const svg = tempContainer.querySelector<SVGSVGElement>("svg");
			if (svg) {
				ensureSvgNamespace(svg);
				const serialized = new XMLSerializer().serializeToString(svg);
				dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
			}
		}

		// Append image directly to target element (like Excalidraw does)
		if (dataUrl) {
			const img = targetEl.createEl("img", { cls: "infographic-print-img" });
			img.setAttribute("src", dataUrl);
			img.setAttribute("alt", "Infographic");

			// Try to persist and swap to a vault-backed resource URL for Electron PDF reliability.
			try {
				const ext = dataUrl.startsWith("data:image/png") ? "png" : "svg";
				const persisted = await persistSnapshotDataUrl(app, cacheDir, dataUrl, ext as "png" | "svg", `${keyBase}|${ext}`);
				img.setAttribute("src", persisted);
			} catch {
				// keep data URL if persistence fails
			}
		} else {
			console.warn("[Infographic Plugin] Could not generate image for PDF export");
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

