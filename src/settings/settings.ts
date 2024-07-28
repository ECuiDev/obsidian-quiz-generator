import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import { languages, models, saveFormats } from "../utils/types";
import QuizGenerator from "../main";
import FolderSuggester from "./folderSuggester";

export default class QuizSettingsTab extends PluginSettingTab {
	private readonly plugin: QuizGenerator;

	constructor(app: App, plugin: QuizGenerator) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("API key")
			.setDesc("Enter your OpenAI API key here.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value.trim();
						await this.plugin.saveSettings();
					}).inputEl.type = "password"
			);

		new Setting(containerEl)
			.setName("API base url")
			.setDesc("Enter your OpenAI API base URL here.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.apiBaseURL)
					.onChange(async (value) => {
						this.plugin.settings.apiBaseURL = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Model")
			.setDesc("Model used for question generation.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(models)
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show note path")
			.setDesc("Turn this off to only show the name of selected notes.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showNotePath)
					.onChange(async (value) => {
						this.plugin.settings.showNotePath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show folder path")
			.setDesc("Turn this off to only show the name of selected folders.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showFolderPath)
					.onChange(async (value) => {
						this.plugin.settings.showFolderPath = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Include notes in subfolders")
			.setDesc("Turn this off to only include notes in the selected folders.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.includeSubfolderNotes)
					.onChange(async (value) => {
						this.plugin.settings.includeSubfolderNotes = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Randomize question order")
			.setDesc("Turn this off to answer questions in their generated/saved order.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.randomizeQuestions)
					.onChange(async (value) => {
						this.plugin.settings.randomizeQuestions = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Language")
			.setDesc("Language questions are generated in.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(languages)
					.setValue(this.plugin.settings.language)
					.onChange(async (value: string) => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName("Generation").setHeading();

		const generationSection = containerEl.createDiv("generation-container-qg");

		new Setting(generationSection)
			.setClass("first-item-qg")
			.setName("Multiple choice")
			.setDesc("Generate multiple choice questions.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateMultipleChoice)
					.onChange(async (value) => {
						this.plugin.settings.generateMultipleChoice = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Multiple choice quantity")
			.setDesc("Number of questions to generate.")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfMultipleChoice)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfMultipleChoice = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(generationSection)
			.setName("True/false")
			.setDesc("Generate true/false questions.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateTrueFalse)
					.onChange(async (value) => {
						this.plugin.settings.generateTrueFalse = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("True/false quantity")
			.setDesc("Number of questions to generate.")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfTrueFalse)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfTrueFalse = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(generationSection)
			.setName("Short answer")
			.setDesc("Generate short answer questions.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateShortAnswer)
					.onChange(async (value) => {
						this.plugin.settings.generateShortAnswer = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Short answer quantity")
			.setDesc("Number of questions to generate.")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfShortAnswer)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfShortAnswer = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(containerEl).setName("Saving").setHeading();

		new Setting(containerEl)
			.setName("Automatically save questions")
			.setDesc("Auto-save all questions upon generation.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoSave)
					.onChange(async (value) => {
						this.plugin.settings.autoSave = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Save location")
			.setDesc("Enter vault path to folder where questions are saved (leave blank to save in vault root folder).")
			.addSearch((search) => {
				new FolderSuggester(this.app, search.inputEl);
				search
					.setValue(this.plugin.settings.questionSavePath)
					.onChange(async (value) => {
						this.plugin.settings.questionSavePath = normalizePath(value);
						await this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName("Save format")
			.setDesc("Format questions are saved as.")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(saveFormats)
					.setValue(this.plugin.settings.questionSaveFormat)
					.onChange(async (value) => {
						this.plugin.settings.questionSaveFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Inline separator")
			.setDesc("Separator for spaced repetition inline flashcards.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.inlineSeparator)
					.onChange(async (value) => {
						this.plugin.settings.inlineSeparator = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Multiline separator")
			.setDesc("Separator for spaced repetition multiline flashcards.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.multilineSeparator)
					.onChange(async (value) => {
						this.plugin.settings.multilineSeparator = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
