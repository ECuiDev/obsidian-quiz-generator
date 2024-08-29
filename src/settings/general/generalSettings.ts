import { Setting } from "obsidian";
import QuizGenerator from "../../main";
import { languages } from "./generalConfig";

const displayGeneralSettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
	new Setting(containerEl)
		.setName("Show note path")
		.setDesc("Turn this off to only show the name of selected notes.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.showNotePath)
				.onChange(async (value) => {
					plugin.settings.showNotePath = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Show folder path")
		.setDesc("Turn this off to only show the name of selected folders.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.showFolderPath)
				.onChange(async (value) => {
					plugin.settings.showFolderPath = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Include notes in subfolders")
		.setDesc("Turn this off to only include notes in the selected folders.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.includeSubfolderNotes)
				.onChange(async (value) => {
					plugin.settings.includeSubfolderNotes = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Randomize question order")
		.setDesc("Turn this off to answer questions in their generated/saved order.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.randomizeQuestions)
				.onChange(async (value) => {
					plugin.settings.randomizeQuestions = value;
					await plugin.saveSettings();
				})
		);

	new Setting(containerEl)
		.setName("Language")
		.setDesc("Language questions are generated in.")
		.addDropdown(dropdown =>
			dropdown
				.addOptions(languages)
				.setValue(plugin.settings.language)
				.onChange(async (value: string) => {
					plugin.settings.language = value;
					await plugin.saveSettings();
				})
		);
};

export default displayGeneralSettings;
