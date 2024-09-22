import { App, TFile } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import { QuizSettings } from "../../settings/config";
import { Question } from "../../utils/types";
import QuizSaver from "../../services/quizSaver";
import QuizModalWrapper from "./QuizModalWrapper";
import { shuffleArray } from "../../utils/helpers";

export default class QuizModalLogic {
	private readonly app: App;
	private readonly settings: QuizSettings;
	private readonly quiz: Question[];
	private readonly quizSources: TFile[];
	private readonly quizSaver: QuizSaver;
	private container: HTMLDivElement | undefined;
	private root: Root | undefined;
	private readonly handleEscapePressed: (event: KeyboardEvent) => void;

	constructor(app: App, settings: QuizSettings, quiz: Question[], quizSources: TFile[]) {
		this.app = app;
		this.settings = settings;
		this.quiz = quiz;
		this.quizSources = quizSources;
		this.quizSaver = new QuizSaver(this.app, this.settings, this.quizSources);
		this.handleEscapePressed = (event: KeyboardEvent): void => {
			if (event.key === "Escape" && !(event.target instanceof HTMLInputElement)) {
				this.removeQuiz();
			}
		};
	}

	public async renderQuiz(): Promise<void> {
		const quiz = this.settings.randomizeQuestions ? shuffleArray(this.quiz) : this.quiz;

		if (this.settings.autoSave && this.quizSources.length > 0) {
			await this.quizSaver.saveAllQuestions(quiz); // move into QuizModal or QuizModalWrapper?
		}

		this.container = document.body.createDiv();
		this.root = createRoot(this.container);
		this.root.render(QuizModalWrapper({
			app: this.app,
			settings: this.settings,
			quiz: quiz,
			quizSaver: this.quizSaver,
			reviewing: this.quizSources.length === 0,
			handleClose: () => this.removeQuiz(),
		}));
		document.body.addEventListener("keydown", this.handleEscapePressed);
	}

	private removeQuiz(): void {
		this.root?.unmount();
		this.container?.remove();
		document.body.removeEventListener("keydown", this.handleEscapePressed);
	}
}
