import { App, normalizePath, PluginSettingTab, Setting } from "obsidian";
import QuizGenerator from "../main";
import FolderSuggester from "./folderSuggester";
import {
	anthropicTextGenModels,
	googleTextGenModels,
	openAITextGenModels,
	perplexityTextGenModels,
	Provider,
	providers
} from "../utils/models";
import { DEFAULT_SETTINGS, languages, saveFormats } from "../utils/config";

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
			.setName("Show note path")
			.setDesc("Turn this off to only show the name of selected notes.")
			.addToggle(toggle =>
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
			.addToggle(toggle =>
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
			.addToggle(toggle =>
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
			.addToggle(toggle =>
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
			.addDropdown(dropdown =>
				dropdown
					.addOptions(languages)
					.setValue(this.plugin.settings.language)
					.onChange(async (value: string) => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName("Model").setHeading();

		new Setting(containerEl)
			.setName("Model provider")
			.setDesc("Model provider to use.")
			.addDropdown(dropdown =>
				dropdown
					.addOptions(providers)
					.setValue(this.plugin.settings.provider)
					.onChange(async (value) => {
						this.plugin.settings.provider = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);

		if (this.plugin.settings.provider === Provider.OPENAI) {
			new Setting(containerEl)
				.setName("OpenAI API key")
				.setDesc("Enter your OpenAI API key here.")
				.addText(text =>
					text
						.setValue(this.plugin.settings.openAIApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openAIApiKey = value.trim();
							await this.plugin.saveSettings();
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
							this.plugin.settings.openAIBaseURL = DEFAULT_SETTINGS.openAIBaseURL;
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addText(text =>
					text
						.setValue(this.plugin.settings.openAIBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.openAIBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Model")
				.setDesc("Model used for quiz generation.")
				.addDropdown(dropdown =>
					dropdown
						.addOptions(openAITextGenModels)
						.setValue(this.plugin.settings.openAITextGenModel)
						.onChange(async (value) => {
							this.plugin.settings.openAITextGenModel = value;
							await this.plugin.saveSettings();
						})
				);
		} else if (this.plugin.settings.provider === Provider.GOOGLE) {
			new Setting(containerEl)
				.setName("Google API key")
				.setDesc("Enter your Google API key here.")
				.addText(text =>
					text
						.setValue(this.plugin.settings.googleApiKey)
						.onChange(async (value) => {
							this.plugin.settings.googleApiKey = value.trim();
							await this.plugin.saveSettings();
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
							this.plugin.settings.googleBaseURL = DEFAULT_SETTINGS.googleBaseURL;
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addText(text =>
					text
						.setValue(this.plugin.settings.googleBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.googleBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Model")
				.setDesc("Model used for quiz generation.")
				.addDropdown(dropdown =>
					dropdown
						.addOptions(googleTextGenModels)
						.setValue(this.plugin.settings.googleTextGenModel)
						.onChange(async (value) => {
							this.plugin.settings.googleTextGenModel = value;
							await this.plugin.saveSettings();
						})
				);
		} else if (this.plugin.settings.provider === Provider.ANTHROPIC) {
			new Setting(containerEl)
				.setName("Anthropic API key")
				.setDesc("Enter your Anthropic API key here.")
				.addText(text =>
					text
						.setValue(this.plugin.settings.anthropicApiKey)
						.onChange(async (value) => {
							this.plugin.settings.anthropicApiKey = value.trim();
							await this.plugin.saveSettings();
						}).inputEl.type = "password"
				);

			new Setting(containerEl)
				.setName("Anthropic API base url")
				.setDesc("Enter your Anthropic API base URL here.")
				.addButton(button =>
					button
						.setClass("clickable-icon")
						.setIcon("rotate-ccw")
						.setTooltip("Restore default")
						.onClick(async () => {
							this.plugin.settings.anthropicBaseURL = DEFAULT_SETTINGS.anthropicBaseURL;
							await this.plugin.saveSettings();
							this.display();
						})
				)
				.addText(text =>
					text
						.setValue(this.plugin.settings.anthropicBaseURL)
						.onChange(async (value) => {
							this.plugin.settings.anthropicBaseURL = value.trim();
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName("Model")
				.setDesc("Model used for quiz generation.")
				.addDropdown(dropdown =>
					dropdown
						.addOptions(anthropicTextGenModels)
						.setValue(this.plugin.settings.anthropicTextGenModel)
						.onChange(async (value) => {
							this.plugin.settings.anthropicTextGenModel = value;
							await this.plugin.saveSettings();
						})
				);
		} else if (this.plugin.settings.provider === Provider.PERPLEXITY) {
			new Setting(containerEl)
				.setName("Perplexity API key")
				.setDesc("Enter your Perplexity API key here.")
				.addText(text =>
					text
						.setValue(this.plugin.settings.perplexityApiKey)
						.onChange(async (value) => {
							this.plugin.settings.perplexityApiKey = value.trim();
							await this.plugin.saveSettings();
						}).inputEl.type = "password"
				);

			new Setting(containerEl)
				.setName("Model")
				.setDesc("Model used for quiz generation.")
				.addDropdown(dropdown =>
					dropdown
						.addOptions(perplexityTextGenModels)
						.setValue(this.plugin.settings.perplexityTextGenModel)
						.onChange(async (value) => {
							this.plugin.settings.perplexityTextGenModel = value;
							await this.plugin.saveSettings();
						})
				);
		}

		new Setting(containerEl).setName("Generation").setHeading();

		const generationSection = containerEl.createDiv("generation-container-qg");

		new Setting(generationSection)
			.setClass("first-item-qg")
			.setName("True or false")
			.setDesc("Generate true or false questions.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.generateTrueFalse)
					.onChange(async (value) => {
						this.plugin.settings.generateTrueFalse = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("True or false quantity")
			.setDesc("Number of questions to generate.")
			.addSlider(slider =>
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
			.setName("Multiple choice")
			.setDesc("Generate multiple choice questions.")
			.addToggle(toggle =>
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
			.addSlider(slider =>
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
			.setName("Select all that apply")
			.setDesc("Generate select all that apply questions.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.generateSelectAllThatApply)
					.onChange(async (value) => {
						this.plugin.settings.generateSelectAllThatApply = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Select all that apply quantity")
			.setDesc("Number of questions to generate.")
			.addSlider(slider =>
				slider
					.setValue(this.plugin.settings.numberOfSelectAllThatApply)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfSelectAllThatApply = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(generationSection)
			.setName("Fill in the blank")
			.setDesc("Generate fill in the blank questions.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.generateFillInTheBlank)
					.onChange(async (value) => {
						this.plugin.settings.generateFillInTheBlank = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Fill in the blank quantity")
			.setDesc("Number of questions to generate.")
			.addSlider(slider =>
				slider
					.setValue(this.plugin.settings.numberOfFillInTheBlank)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfFillInTheBlank = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(generationSection)
			.setName("Matching")
			.setDesc("Generate matching questions.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.generateMatching)
					.onChange(async (value) => {
						this.plugin.settings.generateMatching = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Matching quantity")
			.setDesc("Number of questions to generate.")
			.addSlider(slider =>
				slider
					.setValue(this.plugin.settings.numberOfMatching)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfMatching = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(generationSection)
			.setName("Short answer")
			.setDesc("Generate short answer questions.")
			.addToggle(toggle =>
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
			.addSlider(slider =>
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

		new Setting(generationSection)
			.setName("Long answer")
			.setDesc("Generate long answer questions.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.generateLongAnswer)
					.onChange(async (value) => {
						this.plugin.settings.generateLongAnswer = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(generationSection)
			.setName("Long answer quantity")
			.setDesc("Number of questions to generate.")
			.addSlider(slider =>
				slider
					.setValue(this.plugin.settings.numberOfLongAnswer)
					.setLimits(1, 20, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfLongAnswer = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(containerEl).setName("Saving").setHeading();

		new Setting(containerEl)
			.setName("Automatically save questions")
			.setDesc("Autosave all questions upon generation.")
			.addToggle(toggle =>
				toggle
					.setValue(this.plugin.settings.autoSave)
					.onChange(async (value) => {
						this.plugin.settings.autoSave = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Save location")
			.setDesc("Enter vault path to folder where questions are saved.")
			.addSearch(search => {
				new FolderSuggester(this.app, search.inputEl);
				search
					.setValue(this.plugin.settings.savePath)
					.onChange(async (value) => {
						this.plugin.settings.savePath = normalizePath(value);
						await this.plugin.saveSettings();
					})
			});

		new Setting(containerEl)
			.setName("Save format")
			.setDesc("Format questions are saved as.")
			.addDropdown(dropdown =>
				dropdown
					.addOptions(saveFormats)
					.setValue(this.plugin.settings.saveFormat)
					.onChange(async (value) => {
						this.plugin.settings.saveFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Inline separator")
			.setDesc("Separator for spaced repetition inline flashcards.")
			.addText(text =>
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
			.addText(text =>
				text
					.setValue(this.plugin.settings.multilineSeparator)
					.onChange(async (value) => {
						this.plugin.settings.multilineSeparator = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
