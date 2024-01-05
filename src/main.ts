import { Plugin } from "obsidian";
import SelectorUI from "./ui/selectorUI";
import QuizSettingsTab from "./ui/settingsUI";
import { QuizSettings, DEFAULT_SETTINGS } from "./utils/types";

export default class QuizGenerator extends Plugin {
	settings: QuizSettings;

	async onload() {
		this.addCommand({
			id: "open-generator-gui",
			name: "Open Generator GUI",
			callback: () => {
				new SelectorUI(this.app, this).open();
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
