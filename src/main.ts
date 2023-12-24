import { App, Plugin } from "obsidian";
import QuizUI from "./ui/quizUI";
import QuizSettingsTab from "./ui/settingsUI";

export default class QuizGenerator extends Plugin {
	settings: QuizSettings;

	async onload() {
		this.addCommand({
			id: "open-generator-gui",
			name: "Open Generator GUI",
			callback: () => {
				new QuizUI(this.app).open();
			},
		});

		await this.loadSettings();
		this.addSettingTab(new QuizSettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

interface QuizSettings {
	numberOfMultipleChoice: number;
	numberOfTrueFalse: number;
	numberOfShortAnswer: number;
	generateMultipleChoice: boolean;
	generateTrueFalse: boolean;
	generateShortAnswer: boolean;
	apiKey: string;
}

const DEFAULT_SETTINGS: Partial<QuizSettings> = {
	numberOfMultipleChoice: 1,
	numberOfTrueFalse: 1,
	numberOfShortAnswer: 1,
	generateMultipleChoice: true,
	generateTrueFalse: true,
	generateShortAnswer: true,
	apiKey: ""
};
