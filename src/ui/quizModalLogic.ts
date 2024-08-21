import { App, normalizePath, TFile, TFolder } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { Question, QuizSettings } from "../utils/types";
import QuizSaver from "../services/quizSaver";
import QuizModalWrapper from "./components/quiz/QuizModalWrapper";
import { shuffleArray } from "../utils/helpers";

export default class QuizModalLogic {
	private readonly app: App;
	private readonly settings: QuizSettings;
	private questions: Question[];
	private readonly savedQuestions: boolean[];
	private readonly fileName: string;
	private validSavePath: boolean = false;
	private container: HTMLDivElement | undefined;
	private root: Root | undefined;
	private readonly handleEscapePressed: (event: KeyboardEvent) => void;

	constructor(app: App, settings: QuizSettings, questions: Question[], savedQuestions: boolean[]) {
		this.app = app;
		this.settings = settings;
		this.questions = questions;
		this.savedQuestions = savedQuestions;
		this.fileName = this.getFileName();
		this.handleEscapePressed = (event: KeyboardEvent): void => {
			if (event.key === "Escape" && !(event.target instanceof HTMLInputElement)) {
				this.removeQuiz();
			}
		};
	}

	public async renderQuiz(): Promise<void> {
		if (this.settings.randomizeQuestions) {
			this.questions = shuffleArray(this.questions);
		}
		if (this.settings.autoSave) {
			const unsavedQuestions = this.questions.filter((_, index) => !this.savedQuestions[index]);
			await new QuizSaver(this.app, this.settings, unsavedQuestions, this.fileName,
				this.validSavePath, this.savedQuestions.includes(true)).saveAllQuestions();
			this.savedQuestions.fill(true);
		}
		this.container = document.body.createDiv();
		this.root = createRoot(this.container);
		this.root.render(QuizModalWrapper({
			app: this.app,
			settings: this.settings,
			questions: this.questions,
			initialSavedQuestions: this.savedQuestions,
			fileName: this.fileName,
			validSavePath: this.validSavePath,
			handleClose: () => this.removeQuiz()
		}));
		document.body.addEventListener("keydown", this.handleEscapePressed);
	}

	private removeQuiz(): void {
		this.root?.unmount();
		this.container?.remove();
		document.body.removeEventListener("keydown", this.handleEscapePressed);
	}

	private getFileNames(folder: TFolder): string[] {
		return folder.children
			.filter(file => file instanceof TFile)
			.map(file => file.name.toLowerCase())
			.filter(name => name.startsWith("quiz"));
	}

	private getFileName(): string {
		let count = 1;
		let fileNames: string[];
		const saveFolder = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.savePath.trim()));

		if (saveFolder instanceof TFolder) {
			fileNames = this.getFileNames(saveFolder);
			this.validSavePath = true;
		} else {
			fileNames = this.getFileNames(this.app.vault.getRoot());
		}

		while (fileNames.includes(`quiz ${count}.md`)) {
			count++;
		}

		return `Quiz ${count}.md`;
	}
}
