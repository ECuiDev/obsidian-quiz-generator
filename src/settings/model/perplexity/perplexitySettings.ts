import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { perplexityTextGenModels } from "../../../generators/perplexity/perplexityModels";
import { DEFAULT_PERPLEXITY_SETTINGS } from "./perplexityConfig";

const displayPerplexitySettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Perplexity API key")
		.setDesc("Enter your Perplexity API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.perplexityApiKey)
				.onChange(async (value) => {
					plugin.settings.perplexityApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("Perplexity API base url")
		.setDesc("Enter your Perplexity API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.perplexityBaseURL = DEFAULT_PERPLEXITY_SETTINGS.perplexityBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.perplexityBaseURL)
				.onChange(async (value) => {
					plugin.settings.perplexityBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(perplexityTextGenModels)
				.setValue(plugin.settings.perplexityTextGenModel)
				.onChange(async (value) => {
					plugin.settings.perplexityTextGenModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayPerplexitySettings;
