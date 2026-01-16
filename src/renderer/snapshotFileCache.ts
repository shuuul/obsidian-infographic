import type { App } from "obsidian";

const ensuredDirs = new Map<string, Promise<void>>();

async function ensureDir(app: App, dir: string): Promise<void> {
	const existing = ensuredDirs.get(dir);
	if (existing) {
		await existing;
		return;
	}

	const task = (async () => {
		try {
			await app.vault.adapter.mkdir(dir);
		} catch {
			// ignore: already exists or cannot create (we'll fail on write if truly broken)
		}
	})();
	ensuredDirs.set(dir, task);
	await task;
}

function hashString(input: string): string {
	// FNV-1a 32-bit
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	// unsigned -> hex
	return (h >>> 0).toString(16).padStart(8, "0");
}

function dataUrlIsBase64(dataUrl: string): boolean {
	return dataUrl.includes(";base64,");
}

function dataUrlPayload(dataUrl: string): string {
	const comma = dataUrl.indexOf(",");
	return comma >= 0 ? dataUrl.slice(comma + 1) : "";
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const bin = atob(base64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes.buffer;
}

export async function persistSnapshotDataUrl(
	app: App,
	cacheDir: string,
	dataUrl: string,
	ext: "png" | "svg",
	cacheKey: string
): Promise<string> {
	await ensureDir(app, cacheDir);
	const safeKey = hashString(cacheKey);
	const filePath = `${cacheDir}/${safeKey}.${ext}`;

	if (ext === "png") {
		const payload = dataUrlPayload(dataUrl);
		const buffer = base64ToArrayBuffer(payload);
		await app.vault.adapter.writeBinary(filePath, buffer);
		return app.vault.adapter.getResourcePath(filePath);
	}

	// svg
	const payload = dataUrlPayload(dataUrl);
	const svgText = dataUrlIsBase64(dataUrl) ? atob(payload) : decodeURIComponent(payload);
	await app.vault.adapter.write(filePath, svgText);
	return app.vault.adapter.getResourcePath(filePath);
}

