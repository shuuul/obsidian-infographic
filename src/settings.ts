import {App, PluginSettingTab, SettingDefinitionItem} from "obsidian";
import type InfographicPlugin from "./main";

export type ThemeSetting = "auto" | "light" | "dark";
export type ErrorBehavior = "show-code" | "show-error" | "hide";

export interface InfographicSettings {
	autoRender: boolean;
	theme: ThemeSetting;
	errorBehavior: ErrorBehavior;
}

export const DEFAULT_SETTINGS: InfographicSettings = {
	autoRender: true,
	theme: "auto",
	errorBehavior: "show-code",
};

export class InfographicSettingTab extends PluginSettingTab {
	plugin: InfographicPlugin;

	constructor(app: App, plugin: InfographicPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Declarative settings (Obsidian 1.13+): renders the settings UI and makes
	 * settings searchable in the settings search. Values are read from /
	 * persisted to this.plugin.settings by the framework via getControlValue /
	 * setControlValue.
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Auto render",
				desc: "Automatically render infographic blocks in preview mode",
				control: {key: "autoRender", type: "toggle", defaultValue: DEFAULT_SETTINGS.autoRender},
			},
			{
				name: "Theme",
				desc: "Color theme for infographics",
				control: {
					key: "theme",
					type: "dropdown",
					defaultValue: DEFAULT_SETTINGS.theme,
					options: {auto: "Auto (follow Obsidian)", light: "Light", dark: "Dark"},
				},
			},
			{
				name: "Error behavior",
				desc: "What to display when an infographic fails to render",
				control: {
					key: "errorBehavior",
					type: "dropdown",
					defaultValue: DEFAULT_SETTINGS.errorBehavior,
					options: {"show-code": "Show source code", "show-error": "Show error message only", hide: "Hide block entirely"},
				},
			},
		];
	}
}
