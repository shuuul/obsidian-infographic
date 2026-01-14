import {App, Modal, Notice} from "obsidian";

export class SourceCodeModal extends Modal {
	private source: string;

	constructor(app: App, source: string) {
		super(app);
		this.source = source;
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.addClass("infographic-source-modal");

		contentEl.createEl("h2", {text: "Infographic source"});

		const codeContainer = contentEl.createDiv({cls: "infographic-source-code"});
		const pre = codeContainer.createEl("pre");
		const code = pre.createEl("code");
		code.setText(this.source);

		const buttonContainer = contentEl.createDiv({cls: "infographic-source-buttons"});
		
		const copyButton = buttonContainer.createEl("button", {text: "Copy to clipboard"});
		copyButton.addEventListener("click", () => {
			navigator.clipboard.writeText(this.source).then(() => {
				new Notice("Copied to clipboard");
			}).catch(() => {
				new Notice("Failed to copy");
			});
		});

		const closeButton = buttonContainer.createEl("button", {text: "Close"});
		closeButton.addEventListener("click", () => {
			this.close();
		});
	}

	onClose(): void {
		const {contentEl} = this;
		contentEl.empty();
	}
}
