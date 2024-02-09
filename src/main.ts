import { Plugin, TAbstractFile, TFile } from "obsidian";
import SelectorUI from "./ui/selectorUI";
import QuizSettingsTab from "./settings";
import QuizRevisitor from "./service/quizRevisitor";
import { QuizSettings, DEFAULT_SETTINGS } from "./utils/types";

export default class QuizGenerator extends Plugin {
	settings: QuizSettings;

	async onload(): Promise<void> {
		this.addCommand({
			id: "open-generator",
			name: "Open generator",
			callback: () => {
				new SelectorUI(this.app, this).open();
			}
		});

		this.addRibbonIcon("brain-circuit", "Open generator", async () => {
			new SelectorUI(this.app, this).open();
		});

		this.addCommand({
			id: "open-quiz-from-current-note",
			name: "Open quiz from current note",
			callback: () => {
				new QuizRevisitor(this.app, this).openQuiz(this.app.workspace.getActiveFile());
			}
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file: TAbstractFile) => {
				if (file instanceof TFile && file.extension === "md") {
					menu.addItem((item) => {
						item
							.setTitle("Open quiz from this note")
							.setIcon("scroll-text")
							.onClick(() => {
								new QuizRevisitor(this.app, this).openQuiz(file);
							});
					});
				}
			})
		);

		await this.loadSettings();
		this.addSettingTab(new QuizSettingsTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

}
