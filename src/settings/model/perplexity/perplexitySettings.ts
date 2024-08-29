import { Setting } from "obsidian";
import QuizGenerator from "../../../main";
import { perplexityTextGenModels } from "../../../generators/perplexity/perplexityModels";

const displayPerplexitySettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
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
		.setName("Model")
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
