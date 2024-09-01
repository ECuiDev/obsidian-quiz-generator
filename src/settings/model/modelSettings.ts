import { Setting } from "obsidian";
import QuizGenerator from "../../main";
import { Provider, providers } from "../../generators/providers";
import displayOpenAISettings from "./openai/openAISettings";
import displayGoogleSettings from "./google/googleSettings";
import displayAnthropicSettings from "./anthropic/anthropicSettings";
import displayPerplexitySettings from "./perplexity/perplexitySettings";
import displayMistralSettings from "./mistral/mistralSettings";

const displayModelSettings = (containerEl: HTMLElement, plugin: QuizGenerator, refreshSettings: () => void): void => {
	new Setting(containerEl).setName("Model").setHeading();

	new Setting(containerEl)
		.setName("Model provider")
		.setDesc("Model provider to use.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(providers)
				.setValue(plugin.settings.provider)
				.onChange(async (value) => {
					plugin.settings.provider = value;
					await plugin.saveSettings();
					refreshSettings();
				})
		);

	if (plugin.settings.provider === Provider.OPENAI) {
		displayOpenAISettings(containerEl, plugin, refreshSettings);
	} else if (plugin.settings.provider === Provider.GOOGLE) {
		displayGoogleSettings(containerEl, plugin, refreshSettings);
	} else if (plugin.settings.provider === Provider.ANTHROPIC) {
		displayAnthropicSettings(containerEl, plugin, refreshSettings);
	} else if (plugin.settings.provider === Provider.PERPLEXITY) {
		displayPerplexitySettings(containerEl, plugin);
	} else if (plugin.settings.provider === Provider.MISTRAL) {
		displayMistralSettings(containerEl, plugin, refreshSettings);
	}
};

export default displayModelSettings;
