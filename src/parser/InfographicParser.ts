import {Notice} from "obsidian";

export type ParseResult = {
	success: true;
	content: string;
	isJson: boolean;
} | {
	success: false;
	error: string;
};

export function parseInfographicSpec(source: string): ParseResult {
	const trimmed = source.trim();
	
	if (!trimmed) {
		return {
			success: false,
			error: "Empty infographic block",
		};
	}

	if (trimmed.startsWith("{")) {
		try {
			JSON.parse(trimmed);
			return {
				success: true,
				content: trimmed,
				isJson: true,
			};
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			return {
				success: false,
				error: `Invalid JSON: ${message}`,
			};
		}
	}

	return {
		success: true,
		content: trimmed,
		isJson: false,
	};
}

export function showParseError(error: string): void {
	new Notice(`Infographic Error: ${error}`, 5000);
}
