import { App, Modal, TFile, TFolder, setIcon, setTooltip, normalizePath, Notice } from "obsidian";
import { ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import QuizGenerator from "../main";
import QuestionSaver from "../service/questionSaver";
import "styles.css";

export default class QuizUI extends Modal {
	private plugin: QuizGenerator
	private readonly questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private saved: boolean[];
	private questionIndex: number;
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
		this.questionIndex = 0;
		this.fileCreated = false;
	}

	public onOpen() {
		this.modalEl.addClass("quiz-container");

		this.chooseFileName();
		this.activateButtons();
		this.displayButtons();
		this.showQuestion();
	}

	public onClose() {
		super.onClose();
	}

	private activateButtons() {
		this.backListener = async () => this.showPreviousQuestion();

		this.saveListener = async () => {
			this.saveButton.disabled = true;
			this.saved[this.questionIndex] = true;
			await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[this.questionIndex],
				this.fileName, this.validPath, this.fileCreated).saveQuestion();
			this.fileCreated = true;
			new Notice("Question saved");
		}

		this.saveAllListener = async () => {
			this.saveAllButton.disabled = true;
			for (let index = 0; index < this.questionsAndAnswers.length; index++) {
				if (!this.saved[index]) {
					this.saved[index] = true;
					await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[index],
						this.fileName, this.validPath, this.fileCreated).saveQuestion();
					this.fileCreated = true;
				}
			}
			new Notice("All questions saved");
		}

		this.nextListener = async () => this.showNextQuestion();
	}

	private displayButtons() {
		const buttonsSection = this.modalEl.createDiv("buttons-container");

		this.backButton = buttonsSection.createEl("button");
		this.backButton.addClass("quiz-button");
		setIcon(this.backButton, "arrow-left");
		setTooltip(this.backButton, "Back");

		this.saveButton = buttonsSection.createEl("button");
		this.saveButton.addClass("quiz-button");
		setIcon(this.saveButton, "save");
		setTooltip(this.saveButton, "Save");

		this.saveAllButton = buttonsSection.createEl("button");
		this.saveAllButton.addClass("quiz-button");
		setIcon(this.saveAllButton, "save-all");
		setTooltip(this.saveAllButton, "Save all");

		this.nextButton = buttonsSection.createEl("button");
		this.nextButton.addClass("quiz-button");
		setIcon(this.nextButton, "arrow-right");
		setTooltip(this.nextButton, "Next");

		this.backButton.addEventListener("click", this.backListener);
		this.saveButton.addEventListener("click", this.saveListener);
		this.saveAllButton.addEventListener("click", this.saveAllListener);
		this.nextButton.addEventListener("click", this.nextListener);
	}

	private chooseFileName() {
		let count = 1;
		const folder =
			this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.questionSavePath.trim()));

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

	private showQuestion() {
		this.backButton.disabled = this.questionIndex === 0;
		this.saveButton.disabled = this.saved[this.questionIndex];
		this.saveAllButton.disabled = this.saved.every(value => value);
		this.nextButton.disabled = this.questionIndex === this.questionsAndAnswers.length - 1;

		this.modalEl.empty(); // change to contentEl?

		const question = this.questionsAndAnswers[this.questionIndex];

		const questionText = document.createElement("div");

		switch(this.questionType(question)) {
			case "MC":
				questionText.textContent = (question as ParsedMC).QuestionMC;
				break;
			case "TF":
				questionText.textContent = (question as ParsedTF).QuestionTF;
				break;
			case "SA":
				questionText.textContent = (question as ParsedSA).QuestionSA;
				break;
			default:
				break;
		}

		this.modalEl.appendChild(questionText);

		if (this.questionType(question) === "MC") {
			this.displayMC();
		} else if (this.questionType(question) === "TF") {
			this.displayTF();
		} else if (this.questionType(question) === "SA") {
			this.displaySA();
		} else {
			// Display UI for Error
		}
	}
	
	private displayMC() {
		let choices: string[] = [];

		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["1"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["2"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["3"]);
		choices.push((this.questionsAndAnswers[this.questionIndex] as ParsedMC)["4"]);

		const choicesContainer = document.createElement("div");
		choicesContainer.classList.add("choices-container");

		choices.forEach((choice, choiceNumber) => {
			const choiceButton = document.createElement("button");
			choiceButton.textContent = choice;
			choiceButton.addEventListener("click", () =>
				this.selectMCQAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedMC).Answer, choiceNumber + 1));
			choicesContainer.appendChild(choiceButton);
		});

		this.modalEl.appendChild(choicesContainer);
	}
	
	private displayTF() {
		const trueFalseContainer = document.createElement("div");
		trueFalseContainer.classList.add("true-false-container");

		const trueButton = document.createElement("button");
		trueButton.textContent = "True";
		trueButton.classList.add("true-button");
		trueButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).Answer, true));

		const falseButton = document.createElement("button");
		falseButton.textContent = "False";
		falseButton.classList.add("false-button");
		falseButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedTF).Answer, false));

		trueFalseContainer.appendChild(trueButton);
		trueFalseContainer.appendChild(falseButton);
		this.modalEl.appendChild(trueFalseContainer);
	}
	
	private displaySA() {
		const showAnswerButton = document.createElement("button");
		showAnswerButton.textContent = "Show answer";
		showAnswerButton.classList.add("show-answer-button");
		showAnswerButton.addEventListener("click", () =>
			this.showSAAnswer((this.questionsAndAnswers[this.questionIndex] as ParsedSA).Answer));

		this.modalEl.appendChild(showAnswerButton);
	}

	private showNextQuestion() {
		if (this.questionIndex < this.questionsAndAnswers.length - 1) {
			this.questionIndex++;
			this.showQuestion();
		}
	}

	private showPreviousQuestion() {
		if (this.questionIndex > 0) {
			this.questionIndex--;
			this.showQuestion();
		}
	}

	private selectMCQAnswer(answerNumber: number, choiceNumber: number) {
		const choicesContainer = this.modalEl.querySelector(".choices-container")!;
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

	private selectTFAnswer(answer: boolean, choice: boolean) {
		const trueFalseContainer = this.modalEl.querySelector(".true-false-container")!;
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

	private showSAAnswer(answer: string) {
		const showAnswerButton = this.modalEl.querySelector(".show-answer-button")! as HTMLButtonElement;
		showAnswerButton.textContent = answer;
		showAnswerButton.disabled = true;
	}

	private questionType(question: ParsedMC | ParsedTF | ParsedSA) {
		if ("QuestionMC" in question) {
			return "MC";
		} else if ("QuestionTF" in question) {
			return "TF";
		} else if ("QuestionSA" in question) {
			return "SA";
		} else {
			return "Error";
		}
	}

}
