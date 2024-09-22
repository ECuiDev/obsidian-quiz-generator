import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { googleEmbeddingModels, googleTextGenModels } from "../../../generators/google/googleModels";
import { DEFAULT_GOOGLE_SETTINGS } from "./googleConfig";

const displayGoogleSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Google API key")
		.setDesc("Enter your Google API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.googleApiKey)
				.onChange(async (value) => {
					plugin.settings.googleApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("Google API base url")
		.setDesc("Enter your Google API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.googleBaseURL = DEFAULT_GOOGLE_SETTINGS.googleBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.googleBaseURL)
				.onChange(async (value) => {
					plugin.settings.googleBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(googleTextGenModels)
				.setValue(plugin.settings.googleTextGenModel)
				.onChange(async (value) => {
					plugin.settings.googleTextGenModel = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Embedding model")
		.setDesc("Model used for evaluating short and long answer questions.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(googleEmbeddingModels)
				.setValue(plugin.settings.googleEmbeddingModel)
				.onChange(async (value) => {
					plugin.settings.googleEmbeddingModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayGoogleSettings;
