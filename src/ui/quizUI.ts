import { App, Modal, TFile, TFolder, setIcon, setTooltip, normalizePath } from "obsidian";
import { ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import QuizGenerator from "../main";
import QuestionSaver from "../service/questionSaver";
import "styles.css";

export default class QuizUI extends Modal {
	private plugin: QuizGenerator
	private readonly questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private saved: boolean[];
	private questionIndex: number;
	private readonly backButton: HTMLButtonElement;
	private readonly nextButton: HTMLButtonElement;
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
		this.showQuestion(this.questionIndex);
	}

	public onClose() {
		super.onClose();
	}

	private activateButtons() {
		this.backListener = async () => this.showPreviousQuestion();

		this.saveListener = async () => {
			this.saved[this.questionIndex] = true;
			await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[this.questionIndex],
				this.fileName, this.validPath, this.fileCreated).saveQuestion();
			this.fileCreated = true;
		}

		this.saveAllListener = async () => {
			for (let index = 0; index < this.questionsAndAnswers.length; index++) {
				if (!this.saved[index]) {
					await new QuestionSaver(this.app, this.plugin, this.questionsAndAnswers[index],
						this.fileName, this.validPath, this.fileCreated).saveQuestion();
					this.fileCreated = true;
				}
			}
			this.saved.fill(true);
		}

		this.nextListener = async () => this.showNextQuestion();
	}

	private displayButtons() {
		const buttonsSection = this.modalEl.createDiv("buttons-container");

		const backButton = buttonsSection.createEl("button");
		backButton.addClass("quiz-button");
		setIcon(backButton, "arrow-left");
		setTooltip(backButton, "Back");

		const saveButton = buttonsSection.createEl("button");
		saveButton.addClass("quiz-button");
		setIcon(saveButton, "save");
		setTooltip(saveButton, "Save");

		const saveAllButton = buttonsSection.createEl("button");
		saveAllButton.addClass("quiz-button");
		setIcon(saveAllButton, "save-all");
		setTooltip(saveAllButton, "Save all");

		const nextButton = buttonsSection.createEl("button");
		nextButton.addClass("quiz-button");
		setIcon(nextButton, "arrow-right");
		setTooltip(nextButton, "Next");
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

	private showQuestion(index: number) {
		this.modalEl.empty();

		const question = this.questionsAndAnswers[index];

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
			this.displayMC(index);
		} else if (this.questionType(question) === "TF") {
			this.displayTF(index);
		} else if (this.questionType(question) === "SA") {
			this.displaySA(index);
		} else {
			// Display UI for Error
		}

		this.backButton.disabled = index === 0;
		this.nextButton.disabled = index === this.questionsAndAnswers.length - 1;
	}
	
	private displayMC(index: number) {
		let choices: string[] = [];

		choices.push((this.questionsAndAnswers[index] as ParsedMC)["1"]);
		choices.push((this.questionsAndAnswers[index] as ParsedMC)["2"]);
		choices.push((this.questionsAndAnswers[index] as ParsedMC)["3"]);
		choices.push((this.questionsAndAnswers[index] as ParsedMC)["4"]);

		const choicesContainer = document.createElement("div");
		choicesContainer.classList.add("choices-container");

		choices.forEach((choice, choiceNumber) => {
			const choiceButton = document.createElement("button");
			choiceButton.textContent = choice;
			choiceButton.addEventListener("click", () =>
				this.selectMCQAnswer((this.questionsAndAnswers[index] as ParsedMC).Answer, choiceNumber + 1));
			choicesContainer.appendChild(choiceButton);
		});

		this.modalEl.appendChild(choicesContainer);
	}
	
	private displayTF(index: number) {
		const trueFalseContainer = document.createElement("div");
		trueFalseContainer.classList.add("true-false-container");

		const trueButton = document.createElement("button");
		trueButton.textContent = "True";
		trueButton.classList.add("true-button");
		trueButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[index] as ParsedTF).Answer, true));

		const falseButton = document.createElement("button");
		falseButton.textContent = "False";
		falseButton.classList.add("false-button");
		falseButton.addEventListener("click", () =>
			this.selectTFAnswer((this.questionsAndAnswers[index] as ParsedTF).Answer, false));

		trueFalseContainer.appendChild(trueButton);
		trueFalseContainer.appendChild(falseButton);
		this.modalEl.appendChild(trueFalseContainer);
	}
	
	private displaySA(index: number) {
		const showAnswerButton = document.createElement("button");
		showAnswerButton.textContent = "Show answer";
		showAnswerButton.classList.add("show-answer-button");
		showAnswerButton.addEventListener("click", () =>
			this.showSAAnswer((this.questionsAndAnswers[index] as ParsedSA).Answer));

		this.modalEl.appendChild(showAnswerButton);
	}

	private showNextQuestion() {
		if (this.questionIndex < this.questionsAndAnswers.length - 1) {
			this.questionIndex++;
			this.showQuestion(this.questionIndex);
		}
	}

	private showPreviousQuestion() {
		if (this.questionIndex > 0) {
			this.questionIndex--;
			this.showQuestion(this.questionIndex);
		}
	}
	
	private saveQuestion() {
		
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
