import { Plugin, TAbstractFile, TFile } from "obsidian";
import { DEFAULT_SETTINGS, QuizSettings } from "./utils/types";
import SelectorModal from "./ui/selectorModal";
import QuizSettingsTab from "./settings";
import QuizReviewer from "./services/quizReviewer";

export default class QuizGenerator extends Plugin {
	public settings: QuizSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		// this.addCommand({
		// 	id: "test",
		// 	name: "Test",
		// 	callback: () => {
		// 		const domNode = document.body.createDiv("modal-container mod-dim");
		// 		const root = createRoot(domNode);
		// 		root.render(SelectorModalWrapper({
		// 			app: this.app,
		// 			plugin: this,
		// 			parent: domNode
		// 		}));
		// 	}
		// });

		this.addCommand({
			id: "open-generator",
			name: "Open generator",
			callback: () => {
				new SelectorModal(this.app, this).open();
			}
		});

		this.addRibbonIcon("brain-circuit", "Open generator", async () => {
			new SelectorModal(this.app, this).open();
		});

		this.addCommand({
			id: "open-quiz-from-active-note",
			name: "Open quiz from active note",
			callback: () => {
				new QuizReviewer(this.app, this).openQuiz(this.app.workspace.getActiveFile());
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
								new QuizReviewer(this.app, this).openQuiz(file);
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
