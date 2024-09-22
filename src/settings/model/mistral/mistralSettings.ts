import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { mistralEmbeddingModels, mistralTextGenModels } from "../../../generators/mistral/mistralModels";
import { DEFAULT_MISTRAL_SETTINGS} from "./mistralConfig";

const displayMistralSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Mistral API key")
		.setDesc("Enter your Mistral API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.mistralApiKey)
				.onChange(async (value) => {
					plugin.settings.mistralApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("Mistral API base url")
		.setDesc("Enter your Mistral API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.mistralBaseURL = DEFAULT_MISTRAL_SETTINGS.mistralBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.mistralBaseURL)
				.onChange(async (value) => {
					plugin.settings.mistralBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(mistralTextGenModels)
				.setValue(plugin.settings.mistralTextGenModel)
				.onChange(async (value) => {
					plugin.settings.mistralTextGenModel = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Embedding model")
		.setDesc("Model used for evaluating short and long answer questions.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(mistralEmbeddingModels)
				.setValue(plugin.settings.mistralEmbeddingModel)
				.onChange(async (value) => {
					plugin.settings.mistralEmbeddingModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayMistralSettings;
