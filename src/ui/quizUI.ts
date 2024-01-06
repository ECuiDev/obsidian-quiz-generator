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

			const trueButton = document.createElement("button");
			trueButton.textContent = "True";
			trueButton.addEventListener("click", () =>
				this.selectTFAnswer((this.questionsAndAnswers[index] as ParsedTF).Answer, true));

			const falseButton = document.createElement("button");
			falseButton.textContent = "False";
			falseButton.addEventListener("click", () =>
				this.selectTFAnswer((this.questionsAndAnswers[index] as ParsedTF).Answer, false));

			trueFalseContainer.appendChild(trueButton);
			trueFalseContainer.appendChild(falseButton);
		} else if (this.questionType(question) === "SA") {
			const showAnswerButton = document.createElement("button");
			showAnswerButton.textContent = "Show answer";
			showAnswerButton.addEventListener("click", () =>
				this.showSAAnswer((this.questionsAndAnswers[index] as ParsedSA).Answer));
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
		if (answerNumber === choiceNumber) {
			// Logic for correct choice (make choice button green)
		} else {
			// Logic for incorrect choice (make choice button red)
		}
	}

	private selectTFAnswer(answer: boolean, choice: boolean) {
		if (answer === choice) {
			// Logic for correct choice (make choice button green)
		} else {
			// Logic for incorrect choice (make choice button red)
		}
	}

	private showSAAnswer(answer: string) {
		// Logic for showing the answer
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
