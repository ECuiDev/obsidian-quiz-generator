import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { cohereEmbeddingModels, cohereTextGenModels } from "../../../generators/cohere/cohereModels";
import { DEFAULT_COHERE_SETTINGS } from "./cohereConfig";

const displayCohereSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Cohere API key")
		.setDesc("Enter your Cohere API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.cohereApiKey)
				.onChange(async (value) => {
					plugin.settings.cohereApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("Cohere API base url")
		.setDesc("Enter your Cohere API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.cohereBaseURL = DEFAULT_COHERE_SETTINGS.cohereBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.cohereBaseURL)
				.onChange(async (value) => {
					plugin.settings.cohereBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(cohereTextGenModels)
				.setValue(plugin.settings.cohereTextGenModel)
				.onChange(async (value) => {
					plugin.settings.cohereTextGenModel = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Embedding model")
		.setDesc("Model used for evaluating short and long answer questions.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(cohereEmbeddingModels)
				.setValue(plugin.settings.cohereEmbeddingModel)
				.onChange(async (value) => {
					plugin.settings.cohereEmbeddingModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayCohereSettings;
