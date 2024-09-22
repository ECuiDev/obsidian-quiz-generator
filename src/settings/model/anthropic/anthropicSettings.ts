import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { anthropicTextGenModels } from "../../../generators/anthropic/anthropicModels";
import { DEFAULT_ANTHROPIC_SETTINGS } from "./anthropicConfig";

const displayAnthropicSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Anthropic API key")
		.setDesc("Enter your Anthropic API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.anthropicApiKey)
				.onChange(async (value) => {
					plugin.settings.anthropicApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("Anthropic API base url")
		.setDesc("Enter your Anthropic API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.anthropicBaseURL = DEFAULT_ANTHROPIC_SETTINGS.anthropicBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.anthropicBaseURL)
				.onChange(async (value) => {
					plugin.settings.anthropicBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(anthropicTextGenModels)
				.setValue(plugin.settings.anthropicTextGenModel)
				.onChange(async (value) => {
					plugin.settings.anthropicTextGenModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayAnthropicSettings;
