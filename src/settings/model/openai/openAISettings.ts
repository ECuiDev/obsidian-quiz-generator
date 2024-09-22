import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { openAIEmbeddingModels, openAITextGenModels } from "../../../generators/openai/openAIModels";
import { DEFAULT_OPENAI_SETTINGS } from "./openAIConfig";

const displayOpenAISettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("OpenAI API key")
		.setDesc("Enter your OpenAI API key here.")
		.addText(text =>
			text
				.setValue(plugin.settings.openAIApiKey)
				.onChange(async (value) => {
					plugin.settings.openAIApiKey = value.trim();
					await plugin.saveSettings();
				}).inputEl.type = "password"
		);

	new Setting(containerEl)
		.setName("OpenAI API base url")
		.setDesc("Enter your OpenAI API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.openAIBaseURL = DEFAULT_OPENAI_SETTINGS.openAIBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.openAIBaseURL)
				.onChange(async (value) => {
					plugin.settings.openAIBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Generation model")
		.setDesc("Model used for quiz generation.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(openAITextGenModels)
				.setValue(plugin.settings.openAITextGenModel)
				.onChange(async (value) => {
					plugin.settings.openAITextGenModel = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Embedding model")
		.setDesc("Model used for evaluating short and long answer questions.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(openAIEmbeddingModels)
				.setValue(plugin.settings.openAIEmbeddingModel)
				.onChange(async (value) => {
					plugin.settings.openAIEmbeddingModel = value;
					await plugin.saveSettings();
				})
		);
};

export default displayOpenAISettings;
