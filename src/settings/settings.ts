import { App, PluginSettingTab } from "obsidian";
import QuizGenerator from "../main";
import displayGeneralSettings from "./general/generalSettings";
import displayModelSettings from "./model/modelSettings";
import displayGenerationSettings from "./generation/generationSettings";
import displaySavingSettings from "./saving/savingSettings";

export default class QuizSettingsTab extends PluginSettingTab {
	private readonly plugin: QuizGenerator;

	constructor(app: App, plugin: QuizGenerator) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const refreshSettings = this.display.bind(this);

		displayGeneralSettings(containerEl, this.plugin);
		displayModelSettings(containerEl, this.plugin, refreshSettings);
		displayGenerationSettings(containerEl, this.plugin);
		displaySavingSettings(containerEl, this.plugin);
	}
}
