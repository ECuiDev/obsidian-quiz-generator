import { ParsedMCQ, ParsedTF, ParsedSA, ParsedQuestion } from "../utils/types";

export default class QuestionUI {
	private readonly questionsAndAnswers: (ParsedMCQ | ParsedTF | ParsedSA)[];
	private questionIndex: number;
	private readonly questionContainer: HTMLDivElement;
	private readonly backButton: HTMLButtonElement;
	private readonly nextButton: HTMLButtonElement;

	constructor(questionsAndAnswers: (ParsedMCQ | ParsedTF | ParsedSA)[]) {
		this.questionsAndAnswers = questionsAndAnswers;
		this.questionIndex = 0;

		this.questionContainer = document.createElement("div");
		this.questionContainer.id = "question-container";
		document.body.appendChild(this.questionContainer);

		this.backButton = document.createElement("button");
		this.backButton.textContent = "Previous";
		this.backButton.addEventListener("click", () => this.showPreviousQuestion());

		this.nextButton = document.createElement("button");
		this.nextButton.textContent = "Next";
		this.nextButton.addEventListener("click", () => this.showNextQuestion());

		this.showQuestion(this.questionIndex);
	}

	private showQuestion(index: number) {
		this.questionContainer.empty();

		this.questionContainer.appendChild(this.backButton);
		this.questionContainer.appendChild(this.nextButton);

		const question = this.questionsAndAnswers[index];

		const questionText = document.createElement("div");

		switch(this.questionType(question)) {
			case "MC":
				questionText.textContent = (question as ParsedMCQ).QuestionMC;
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

		this.questionContainer.appendChild(questionText);

		if (this.questionType(question) === "MC") {
			let choices: string[] = [];

			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["1"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["2"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["3"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["4"]);

			const choicesContainer = document.createElement("div");
			choicesContainer.classList.add("choices-container");

			choices.forEach((choice, choiceNumber) => {
				const choiceButton = document.createElement("button");
				choiceButton.textContent = choice;
				choiceButton.addEventListener("click", () =>
					this.selectMCQAnswer((this.questionsAndAnswers[index] as ParsedMCQ).Answer, choiceNumber + 1));
				choicesContainer.appendChild(choiceButton);
			});

			this.questionContainer.appendChild(choicesContainer);
		} else if (this.questionType(question) === "TF") {
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
			this.questionContainer.appendChild(trueFalseContainer);
		} else if (this.questionType(question) === "SA") {
			const showAnswerButton = document.createElement("button");
			showAnswerButton.textContent = "Show answer";
			showAnswerButton.classList.add("show-answer-button");
			showAnswerButton.addEventListener("click", () =>
				this.showSAAnswer((this.questionsAndAnswers[index] as ParsedSA).Answer));

			this.questionContainer.appendChild(showAnswerButton);
		} else {
			// Display UI for Error
		}

		this.backButton.disabled = index === 0;
		this.nextButton.disabled = index === this.questionsAndAnswers.length - 1;
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

	private selectMCQAnswer(answerNumber: number, choiceNumber: number) {
		const choicesContainer = this.questionContainer.querySelector(".choices-container")!;
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
		const trueFalseContainer = this.questionContainer.querySelector(".true-false-container")!;
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
		const showAnswerButton = this.questionContainer.querySelector(".show-answer-button")! as HTMLButtonElement;
		showAnswerButton.textContent = answer;
		showAnswerButton.disabled = true;
	}

	private questionType(question: ParsedQuestion) {
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
