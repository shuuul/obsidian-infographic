import {App, PluginSettingTab, Setting} from "obsidian";
import type InfographicPlugin from "./main";

export type ThemeSetting = "auto" | "light" | "dark";
export type ErrorBehavior = "show-code" | "show-error" | "hide";

export interface InfographicSettings {
	autoRender: boolean;
	showSourceButton: boolean;
	maxWidth: number;
	maxHeight: number;
	theme: ThemeSetting;
	errorBehavior: ErrorBehavior;
}

export const DEFAULT_SETTINGS: InfographicSettings = {
	autoRender: true,
	showSourceButton: true,
	maxWidth: 800,
	maxHeight: 600,
	theme: "auto",
	errorBehavior: "show-code",
};

export class InfographicSettingTab extends PluginSettingTab {
	plugin: InfographicPlugin;

	constructor(app: App, plugin: InfographicPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Auto render")
			.setDesc("Automatically render infographic blocks in preview mode")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoRender)
				.onChange(async (value) => {
					this.plugin.settings.autoRender = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Show source button")
			.setDesc("Display a button to view the source code of infographics")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showSourceButton)
				.onChange(async (value) => {
					this.plugin.settings.showSourceButton = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Theme")
			.setDesc("Color theme for infographics")
			.addDropdown(dropdown => dropdown
				.addOption("auto", "Auto (follow Obsidian)")
				.addOption("light", "Light")
				.addOption("dark", "Dark")
				.setValue(this.plugin.settings.theme)
				.onChange(async (value) => {
					this.plugin.settings.theme = value as ThemeSetting;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Error behavior")
			.setDesc("What to display when an infographic fails to render")
			.addDropdown(dropdown => dropdown
				.addOption("show-code", "Show source code")
				.addOption("show-error", "Show error message only")
				.addOption("hide", "Hide block entirely")
				.setValue(this.plugin.settings.errorBehavior)
				.onChange(async (value) => {
					this.plugin.settings.errorBehavior = value as ErrorBehavior;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Max width")
			.setDesc("Maximum width for rendered infographics (in pixels)")
			.addText(text => text
				.setPlaceholder("800")
				.setValue(String(this.plugin.settings.maxWidth))
				.onChange(async (value) => {
					const num = parseInt(value, 10);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.maxWidth = num;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName("Max height")
			.setDesc("Maximum height for rendered infographics (in pixels)")
			.addText(text => text
				.setPlaceholder("600")
				.setValue(String(this.plugin.settings.maxHeight))
				.onChange(async (value) => {
					const num = parseInt(value, 10);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.maxHeight = num;
						await this.plugin.saveSettings();
					}
				}));
	}
}
