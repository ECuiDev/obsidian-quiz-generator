import { Setting } from "obsidian";
import QuizGenerator from "../../main";

const displayGenerationSettings = (containerEl: HTMLElement, plugin: QuizGenerator): void => {
	new Setting(containerEl).setName("Generation").setHeading();

	const generationSection = containerEl.createDiv("generation-container-qg");

	new Setting(generationSection)
		.setClass("first-item-qg")
		.setName("True or false")
		.setDesc("Generate true or false questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateTrueFalse)
				.onChange(async (value) => {
					plugin.settings.generateTrueFalse = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("True or false quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfTrueFalse)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfTrueFalse = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Multiple choice")
		.setDesc("Generate multiple choice questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateMultipleChoice)
				.onChange(async (value) => {
					plugin.settings.generateMultipleChoice = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Multiple choice quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfMultipleChoice)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfMultipleChoice = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Select all that apply")
		.setDesc("Generate select all that apply questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateSelectAllThatApply)
				.onChange(async (value) => {
					plugin.settings.generateSelectAllThatApply = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Select all that apply quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfSelectAllThatApply)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfSelectAllThatApply = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Fill in the blank")
		.setDesc("Generate fill in the blank questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateFillInTheBlank)
				.onChange(async (value) => {
					plugin.settings.generateFillInTheBlank = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Fill in the blank quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfFillInTheBlank)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfFillInTheBlank = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Matching")
		.setDesc("Generate matching questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateMatching)
				.onChange(async (value) => {
					plugin.settings.generateMatching = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Matching quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfMatching)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfMatching = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Short answer")
		.setDesc("Generate short answer questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateShortAnswer)
				.onChange(async (value) => {
					plugin.settings.generateShortAnswer = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Short answer quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfShortAnswer)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfShortAnswer = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);

	new Setting(generationSection)
		.setName("Long answer")
		.setDesc("Generate long answer questions.")
		.addToggle(toggle =>
			toggle
				.setValue(plugin.settings.generateLongAnswer)
				.onChange(async (value) => {
					plugin.settings.generateLongAnswer = value;
					await plugin.saveSettings();
				})
		);

	new Setting(generationSection)
		.setName("Long answer quantity")
		.setDesc("Number of questions to generate.")
		.addSlider(slider =>
			slider
				.setValue(plugin.settings.numberOfLongAnswer)
				.setLimits(1, 20, 1)
				.onChange(async (value) => {
					plugin.settings.numberOfLongAnswer = value;
					await plugin.saveSettings();
				})
				.setDynamicTooltip()
				.showTooltip()
		);
};

export default displayGenerationSettings;
