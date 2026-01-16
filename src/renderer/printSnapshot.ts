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

export function refreshInfographicPrintSnapshot(wrapperEl: HTMLElement): void {
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
	}
}

export function refreshAllInfographicPrintSnapshots(root: ParentNode = document): void {
	const wrappers = root.querySelectorAll<HTMLElement>(".infographic-wrapper");
	wrappers.forEach((wrapper) => refreshInfographicPrintSnapshot(wrapper));
}

