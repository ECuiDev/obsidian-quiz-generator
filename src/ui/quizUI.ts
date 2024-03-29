import { App, Modal, TFile, TFolder, setIcon, setTooltip, normalizePath, MarkdownRenderer, Notice } from "obsidian";
import { ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import QuizGenerator from "../main";
import QuestionSaver from "../services/questionSaver";
import "styles.css";

export default class QuizUI extends Modal {
	private readonly plugin: QuizGenerator
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private saved: boolean[];
	private questionIndex: number;
	private questionContainer: HTMLDivElement;
	private buttonContainer: HTMLDivElement;
	private backButton: HTMLButtonElement;
	private saveButton: HTMLButtonElement;
	private saveAllButton: HTMLButtonElement;
	private nextButton: HTMLButtonElement;
	private backListener: () => void;
	private saveListener: () => void;
	private saveAllListener: () => void;
	private nextListener: () => void;
	private fileName: string;
	private validPath: boolean;
	private fileCreated: boolean;

	constructor(app: App, plugin: QuizGenerator, questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[]) {
		super(app);
		this.plugin = plugin;
		this.questionsAndAnswers = questionsAndAnswers;
		this.saved = new Array(this.questionsAndAnswers.length).fill(false);
		this.fileCreated = false;

		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.addClass("title-style");

		this.chooseFileName();
		this.activateButtons();
		this.displayButtons();
		this.displayLine();
		this.displayQuestionContainer();

		if (this.plugin.settings.autoSave) {
			this.saveAllListener();
		}
	}

	public async onOpen(): Promise<void> {
		if (this.plugin.settings.randomizeQuestions) {
			this.shuffleQuestions(this.questionsAndAnswers);
		}

		this.questionIndex = 0;
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
		const folder = this.app.vault.getFolderByPath(normalizePath(this.plugin.settings.questionSavePath.trim()));

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
		this.backListener = async (): Promise<void> => this.showPreviousQuestion();

		this.saveListener = async (): Promise<void> => {
			this.saveButton.disabled = true;
			this.saveAllButton.disabled = this.saved.every(value => value);

			this.saved[this.questionIndex] = true;
			await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[this.questionIndex],
				this.fileName, this.validPath, this.fileCreated).saveQuestion();
			this.fileCreated = true;

			if (this.validPath) {
				new Notice("Question saved");
			} else {
				new Notice("Invalid path: Question saved in vault root folder");
			}
		}

		this.saveAllListener = async (): Promise<void> => {
			this.saveButton.disabled = true;
			this.saveAllButton.disabled = true;

			for (let index = 0; index < this.questionsAndAnswers.length; index++) {
				if (!this.saved[index]) {
					this.saved[index] = true;
					await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[index],
						this.fileName, this.validPath, this.fileCreated).saveQuestion();
					this.fileCreated = true;
				}
			}

			if (this.validPath) {
				new Notice("All questions saved");
			} else {
				new Notice("Invalid path: All questions saved in vault root folder");
			}
		}

		this.nextListener = async (): Promise<void> => this.showNextQuestion();
	}

	private displayButtons(): void {
		this.buttonContainer = this.contentEl.createDiv("quiz-button-container");

		this.backButton = this.buttonContainer.createEl("button");
		this.backButton.addClass("ui-button");
		setIcon(this.backButton, "arrow-left");
		setTooltip(this.backButton, "Back");

		this.saveButton = this.buttonContainer.createEl("button");
		this.saveButton.addClass("ui-button");
		setIcon(this.saveButton, "save");
		setTooltip(this.saveButton, "Save");

		this.saveAllButton = this.buttonContainer.createEl("button");
		this.saveAllButton.addClass("ui-button");
		setIcon(this.saveAllButton, "save-all");
		setTooltip(this.saveAllButton, "Save all");

		this.nextButton = this.buttonContainer.createEl("button");
		this.nextButton.addClass("ui-button");
		setIcon(this.nextButton, "arrow-right");
		setTooltip(this.nextButton, "Next");

		this.backButton.addEventListener("click", this.backListener);
		this.saveButton.addEventListener("click", this.saveListener);
		this.saveAllButton.addEventListener("click", this.saveAllListener);
		this.nextButton.addEventListener("click", this.nextListener);
	}

	private displayLine(): void {
		const line = this.contentEl.createEl("hr");
		line.addClass("quiz-divider");
	}

	private displayQuestionContainer(): void {
		this.questionContainer = this.contentEl.createDiv("question-container");
	}

	private async showQuestion(): Promise<void> {
		this.backButton.disabled = this.questionIndex === 0;
		this.saveButton.disabled = this.saved[this.questionIndex];
		this.saveAllButton.disabled = this.saved.every(value => value);
		this.nextButton.disabled = this.questionIndex === this.questionsAndAnswers.length - 1;

		this.questionContainer.empty();
		this.titleEl.setText("Question " + (this.questionIndex + 1));

		const question = this.questionsAndAnswers[this.questionIndex];

		const questionText = this.questionContainer.createDiv("question");

		switch (this.questionType(question)) {
			case "MC":
				await MarkdownRenderer.render(this.app, (question as ParsedMC).questionMC, questionText, "", this.plugin);
				break;
			case "TF":
				await MarkdownRenderer.render(this.app, (question as ParsedTF).questionTF, questionText, "", this.plugin);
				break;
			case "SA":
				await MarkdownRenderer.render(this.app, (question as ParsedSA).questionSA, questionText, "", this.plugin);
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
			await MarkdownRenderer.render(this.app, choice, choiceButton, "", this.plugin);
			choiceButton.addEventListener("click", () =>
				this.selectMCQAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedMC).answer, choiceNumber + 1));
		}
	}
	
	private displayTF(): void {
		const trueFalseContainer = this.questionContainer.createDiv("mc-tf-container");

		const trueButton = trueFalseContainer.createEl("button");
		trueButton.textContent = "True";
		trueButton.addClass("true-button");
		trueButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).answer, true));

		const falseButton = trueFalseContainer.createEl("button");
		falseButton.textContent = "False";
		falseButton.addClass("false-button");
		falseButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).answer, false));
	}
	
	private displaySA(): void {
		const showAnswerButton = this.questionContainer.createEl("button");
		showAnswerButton.textContent = "Show answer";
		showAnswerButton.classList.add("show-answer-button");
		showAnswerButton.addEventListener("click", () =>
			this.showSAAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedSA).answer));
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
		await MarkdownRenderer.render(this.app, answer, showAnswerButton, "", this.plugin);
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
