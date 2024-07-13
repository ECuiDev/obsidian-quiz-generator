import {
	App,
	Component,
	MarkdownRenderer,
	Modal,
	normalizePath,
	Notice,
	Scope,
	setIcon,
	setTooltip,
	TFile,
	TFolder
} from "obsidian";
import { ParsedMC, ParsedSA, ParsedTF, QuizSettings } from "../utils/types";
import QuestionSaver from "../services/questionSaver";

export default class QuizModal extends Modal {
	private readonly settings: QuizSettings;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private readonly saved: boolean[];
	private questionIndex: number = 0;
	private questionContainer: HTMLDivElement;
	private buttonContainer: HTMLDivElement;
	private readonly previousButton: HTMLButtonElement;
	private readonly saveButton: HTMLButtonElement;
	private readonly saveAllButton: HTMLButtonElement;
	private readonly nextButton: HTMLButtonElement;
	private readonly previousQuestionHandler: () => void;
	private readonly saveQuestionHandler: () => void;
	private readonly saveAllQuestionsHandler: () => void;
	private readonly nextQuestionHandler: () => void;
	private fileName: string = "Quiz 0.md";
	private validPath: boolean = false;
	private fileCreated: boolean = false;
	private readonly component: Component;

	constructor(app: App, settings: QuizSettings, questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[]) {
		super(app);
		this.settings = settings;
		this.questionsAndAnswers = questionsAndAnswers;
		this.saved = new Array(this.questionsAndAnswers.length).fill(false);
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
		this.component = new Component();

		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.addClass("title-style");

		this.buttonContainer = this.contentEl.createDiv("quiz-button-container");
		this.previousButton = this.buttonContainer.createEl("button");
		this.saveButton = this.buttonContainer.createEl("button");
		this.saveAllButton = this.buttonContainer.createEl("button");
		this.nextButton = this.buttonContainer.createEl("button");
		this.contentEl.createEl("hr").addClass("quiz-divider");
		this.questionContainer = this.contentEl.createDiv("question-container");

		this.previousQuestionHandler = async (): Promise<void> => await this.showPreviousQuestion();
		this.saveQuestionHandler = async (): Promise<void> => {
			this.saveButton.disabled = true;
			this.saveAllButton.disabled = this.saved.every(value => value);

			this.saved[this.questionIndex] = true;
			await new QuestionSaver(this.app, this.settings, this.questionsAndAnswers[this.questionIndex],
				this.fileName, this.validPath, this.fileCreated).saveQuestion();
			this.fileCreated = true;

			if (this.validPath) {
				new Notice("Question saved");
			} else {
				new Notice("Invalid path: Question saved in vault root folder");
			}
		};
		this.saveAllQuestionsHandler = async (): Promise<void> => {
			this.saveButton.disabled = true;
			this.saveAllButton.disabled = true;

			for (let index = 0; index < this.questionsAndAnswers.length; index++) {
				if (!this.saved[index]) {
					this.saved[index] = true;
					await new QuestionSaver(this.app, this.settings, this.questionsAndAnswers[index],
						this.fileName, this.validPath, this.fileCreated).saveQuestion();
					this.fileCreated = true;
				}
			}

			if (this.validPath) {
				new Notice("All questions saved");
			} else {
				new Notice("Invalid path: All questions saved in vault root folder");
			}
		};
		this.nextQuestionHandler = async (): Promise<void> => await this.showNextQuestion();

		this.activateButtons();
		this.chooseFileName();
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		if (this.settings.randomizeQuestions) {
			this.shuffleQuestions(this.questionsAndAnswers);
		}
		if (this.settings.autoSave) {
			this.saveAllQuestionsHandler();
		}
		await this.showQuestion();
	}

	public onClose(): void {
		super.onClose();
	}

	public disableSave(): void {
		this.saved.fill(true);
	}

	private shuffleQuestions(questions: (ParsedMC | ParsedTF | ParsedSA)[]): void {
		this.questionsAndAnswers = questions.slice();

		for (let i = this.questionsAndAnswers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.questionsAndAnswers[i], this.questionsAndAnswers[j]] = [this.questionsAndAnswers[j], this.questionsAndAnswers[i]];
		}
	}

	private chooseFileName(): void {
		let count = 1;
		const folder = this.app.vault.getAbstractFileByPath(normalizePath(this.settings.questionSavePath.trim()));

		if (folder instanceof TFolder) {
			const fileNames = folder.children
				.filter(file => file instanceof TFile)
				.map(file => file.name.toLowerCase())
				.filter(name => name.startsWith("quiz"));

			while (fileNames.includes(`quiz ${count}.md`)) {
				count++;
			}

			this.fileName = `Quiz ${count}.md`;
			this.validPath = true;
		} else {
			const rootFileNames = this.app.vault.getRoot().children
				.filter(file => file instanceof TFile)
				.map(file => file.name.toLowerCase())
				.filter(name => name.startsWith("quiz"));

			while (rootFileNames.includes(`quiz ${count}.md`)) {
				count++;
			}

			this.fileName = `Quiz ${count}.md`;
			this.validPath = false;
		}
	}

	private activateButtons(): void {
		this.previousButton.addClass("ui-button");
		setIcon(this.previousButton, "arrow-left");
		setTooltip(this.previousButton, "Back");

		this.saveButton.addClass("ui-button");
		setIcon(this.saveButton, "save");
		setTooltip(this.saveButton, "Save");

		this.saveAllButton.addClass("ui-button");
		setIcon(this.saveAllButton, "save-all");
		setTooltip(this.saveAllButton, "Save all");

		this.nextButton.addClass("ui-button");
		setIcon(this.nextButton, "arrow-right");
		setTooltip(this.nextButton, "Next");

		this.previousButton.addEventListener("click", this.previousQuestionHandler);
		this.saveButton.addEventListener("click", this.saveQuestionHandler);
		this.saveAllButton.addEventListener("click", this.saveAllQuestionsHandler);
		this.nextButton.addEventListener("click", this.nextQuestionHandler);
	}

	private async showQuestion(): Promise<void> {
		this.previousButton.disabled = this.questionIndex === 0;
		this.saveButton.disabled = this.saved[this.questionIndex];
		this.saveAllButton.disabled = this.saved.every(value => value);
		this.nextButton.disabled = this.questionIndex === this.questionsAndAnswers.length - 1;

		this.questionContainer.empty();
		this.titleEl.setText("Question " + (this.questionIndex + 1));

		const question = this.questionsAndAnswers[this.questionIndex];

		const questionText = this.questionContainer.createDiv("question");

		switch (this.questionType(question)) {
			case "MC":
				await MarkdownRenderer.render(this.app, (question as ParsedMC).questionMC, questionText, "", this.component);
				break;
			case "TF":
				await MarkdownRenderer.render(this.app, (question as ParsedTF).questionTF, questionText, "", this.component);
				break;
			case "SA":
				await MarkdownRenderer.render(this.app, (question as ParsedSA).questionSA, questionText, "", this.component);
				break;
			default:
				break;
		}

		if (this.questionType(question) === "MC") {
			await this.displayMC();
		} else if (this.questionType(question) === "TF") {
			this.displayTF();
		} else if (this.questionType(question) === "SA") {
			this.displaySA();
		} else {
			questionText.textContent = "Error";
		}
	}
	
	private async displayMC(): Promise<void> {
		let choices: string[] = [];

		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["1"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["2"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["3"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["4"]);

		const choicesContainer = this.questionContainer.createDiv("mc-tf-container");

		for (const choice of choices) {
			const choiceNumber = choices.indexOf(choice);
			const choiceButton = choicesContainer.createEl("button");
			await MarkdownRenderer.render(this.app, choice, choiceButton, "", this.component);
			choiceButton.addEventListener("click", (): void =>
				this.selectMCQAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedMC).answer, choiceNumber + 1));
		}
	}
	
	private displayTF(): void {
		const trueFalseContainer = this.questionContainer.createDiv("mc-tf-container");

		const trueButton = trueFalseContainer.createEl("button");
		trueButton.textContent = "True";
		trueButton.addClass("true-button");
		trueButton.addEventListener("click", (): void =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).answer, true));

		const falseButton = trueFalseContainer.createEl("button");
		falseButton.textContent = "False";
		falseButton.addClass("false-button");
		falseButton.addEventListener("click", (): void =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).answer, false));
	}
	
	private displaySA(): void {
		const showAnswerButton = this.questionContainer.createEl("button");
		showAnswerButton.textContent = "Show answer";
		showAnswerButton.classList.add("show-answer-button");
		showAnswerButton.addEventListener("click", async (): Promise<void> =>
			await this.showSAAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedSA).answer));
	}

	private async showNextQuestion(): Promise<void> {
		if (this.questionIndex < this.questionsAndAnswers.length - 1) {
			this.questionIndex++;
			await this.showQuestion();
		}
	}

	private async showPreviousQuestion(): Promise<void> {
		if (this.questionIndex > 0) {
			this.questionIndex--;
			await this.showQuestion();
		}
	}

	private selectMCQAnswer(answerNumber: number, choiceNumber: number): void {
		const choicesContainer = this.questionContainer.querySelector(".mc-tf-container")!;
		const choiceButtons = choicesContainer.querySelectorAll("button");

		choiceButtons.forEach((button) => {
			button.disabled = true;
		});

		if (answerNumber === choiceNumber) {
			choiceButtons[choiceNumber - 1].classList.add("correct-choice");
		} else {
			choiceButtons[choiceNumber - 1].classList.add("incorrect-choice");
			choiceButtons[answerNumber - 1].classList.add("correct-choice");
		}
	}

	private selectTFAnswer(answer: boolean, choice: boolean): void {
		const trueFalseContainer = this.questionContainer.querySelector(".mc-tf-container")!;
		const trueButton = trueFalseContainer.querySelector(".true-button")! as HTMLButtonElement;
		const falseButton = trueFalseContainer.querySelector(".false-button")! as HTMLButtonElement;

		trueButton.disabled = true;
		falseButton.disabled = true;

		// Improve this
		if (choice === answer) {
			choice ? trueButton.classList.add("correct-choice") : falseButton.classList.add("correct-choice");
		} else {
			choice ? trueButton.classList.add("incorrect-choice") : falseButton.classList.add("incorrect-choice");
			answer ? trueButton.classList.add("correct-choice") : falseButton.classList.add("correct-choice");
		}
	}

	private async showSAAnswer(answer: string): Promise<void> {
		const showAnswerButton = this.questionContainer.querySelector(".show-answer-button")! as HTMLButtonElement;
		showAnswerButton.textContent = "";
		await MarkdownRenderer.render(this.app, answer, showAnswerButton, "", this.component);
		showAnswerButton.disabled = true;
	}

	private questionType(question: ParsedMC | ParsedTF | ParsedSA): "MC" | "TF" | "SA" | "Error" {
		if ("questionMC" in question) {
			return "MC";
		} else if ("questionTF" in question) {
			return "TF";
		} else if ("questionSA" in question) {
			return "SA";
		} else {
			return "Error";
		}
	}
}
