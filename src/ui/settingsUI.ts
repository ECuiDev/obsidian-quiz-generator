import { App, PluginSettingTab, Setting} from "obsidian";
import QuizGenerator from "../main";

export default class QuizSettingsTab extends PluginSettingTab {
	private plugin: QuizGenerator;

	constructor(app: App, plugin: QuizGenerator) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Generate Multiple Choice Questions")
			.setDesc("Do you want to generate multiple choice questions?")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateMultipleChoice)
					.onChange(async (value) => {
						this.plugin.settings.generateMultipleChoice = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Number of Multiple Choice Questions")
			.setDesc("How many multiple choice questions do you want to generate?")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfMultipleChoice)
					.setLimits(1, 10, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfMultipleChoice = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(containerEl)
			.setName("Generate True/False Questions")
			.setDesc("Do you want to generate true/false questions?")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateTrueFalse)
					.onChange(async (value) => {
						this.plugin.settings.generateTrueFalse = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Number of True/False Questions")
			.setDesc("How many true/false questions do you want to generate?")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfTrueFalse)
					.setLimits(1, 10, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfTrueFalse = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(containerEl)
			.setName("Generate Short Answer Questions")
			.setDesc("Do you want to generate short answer questions?")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.generateShortAnswer)
					.onChange(async (value) => {
						this.plugin.settings.generateShortAnswer = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Number of Multiple Choice Questions")
			.setDesc("How many multiple choice questions do you want to generate?")
			.addSlider((slider) =>
				slider
					.setValue(this.plugin.settings.numberOfShortAnswer)
					.setLimits(1, 10, 1)
					.onChange(async (value) => {
						this.plugin.settings.numberOfShortAnswer = value;
						await this.plugin.saveSettings();
					})
					.setDynamicTooltip()
					.showTooltip()
			);

		new Setting(containerEl)
			.setName("API Key")
			.setDesc("Enter your OpenAI API key here.")
			.addText((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);
	}

}
