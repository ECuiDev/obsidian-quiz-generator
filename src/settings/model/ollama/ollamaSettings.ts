import { Notice, Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { DEFAULT_OLLAMA_SETTINGS } from "./ollamaConfig";
import { getOllamaTextGenModels } from "../../../generators/ollama/ollamaModels";

const displayOllamaSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl)
		.setName("Ollama API base url")
		.setDesc("Enter your Ollama API base URL here.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("rotate-ccw")
				.setTooltip("Restore default")
				.onClick(async () => {
					plugin.settings.ollamaBaseURL = DEFAULT_OLLAMA_SETTINGS.ollamaBaseURL;
					await plugin.saveSettings();
					refreshSettings();
				})
		)
		.addText(text =>
			text
				.setValue(plugin.settings.ollamaBaseURL)
				.onChange(async (value) => {
					plugin.settings.ollamaBaseURL = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Model")
		.setDesc("Model used for quiz generation.")
		.addButton(button =>
			button
				.setClass("clickable-icon")
				.setIcon("refresh-ccw")
				.setTooltip("Refresh models")
				.onClick(() => refreshSettings())
		)
		.addDropdown(async (dropdown) => {
			const models = await getOllamaTextGenModels(plugin.settings.ollamaBaseURL);
			const noModelsAvailable = Object.keys(models).length === 0;
			if (noModelsAvailable) {
				new Notice("No Ollama models available");
			}
			dropdown
				.addOptions(models)
				.setValue(plugin.settings.ollamaTextGenModel)
				.onChange(async (value) => {
					plugin.settings.ollamaTextGenModel = value;
					await plugin.saveSettings();
				})
				.setDisabled(noModelsAvailable);
		});
};

export default displayOllamaSettings;
