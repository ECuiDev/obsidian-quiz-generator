import { normalizePath, Setting } from "obsidian";
import QuizGenerator from "../../main";
import FolderSuggester from "./folderSuggester";
import { saveFormats } from "./savingConfig";

const displaySavingSettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
	new Setting(containerEl).setName("Saving").setHeading();

	new Setting(containerEl)
		.setName("Automatically save questions")
		.setDesc("Autosave all questions upon generation.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.autoSave)
				.onChange(async (value) => {
					plugin.settings.autoSave = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Save location")
		.setDesc("Enter vault path to folder where questions are saved.")
		.addSearch(search => {
			new FolderSuggester(plugin.app, search.inputEl);
			search
				.setValue(plugin.settings.savePath)
				.onChange(async (value) => {
					plugin.settings.savePath = normalizePath(value.trim());
					await plugin.saveSettings();
				})
		});

	new Setting(containerEl)
		.setName("Save format")
		.setDesc("Format questions are saved as.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(saveFormats)
				.setValue(plugin.settings.saveFormat)
				.onChange(async (value) => {
					plugin.settings.saveFormat = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Quiz material property")
		.setDesc("Property name for links to notes used in quiz generation. Leave empty to disable.")
		.addText(text =>
			text
				.setValue(plugin.settings.quizMaterialProperty)
				.onChange(async (value) => {
					plugin.settings.quizMaterialProperty = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Inline separator")
		.setDesc("Separator for spaced repetition inline flashcards.")
		.addText(text =>
			text
				.setValue(plugin.settings.inlineSeparator)
				.onChange(async (value) => {
					plugin.settings.inlineSeparator = value.trim();
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Multiline separator")
		.setDesc("Separator for spaced repetition multiline flashcards.")
		.addText(text =>
			text
				.setValue(plugin.settings.multilineSeparator)
				.onChange(async (value) => {
					plugin.settings.multilineSeparator = value.trim();
					await plugin.saveSettings();
				})
		);
};

export default displaySavingSettings;
