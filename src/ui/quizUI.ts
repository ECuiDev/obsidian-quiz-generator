import { ParsedMCQ, ParsedTF, ParsedSA, ParsedQuestion } from "../utils/types";

export class QuestionUI {
	private readonly questionsAndAnswers: (ParsedMCQ | ParsedTF | ParsedSA)[];
	private questionIndex: number;
	private questionContainer: HTMLDivElement;
	private backButton: HTMLButtonElement;
	private nextButton: HTMLButtonElement;

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

		this.questionContainer.appendChild(this.backButton);
		this.questionContainer.appendChild(this.nextButton);

		this.showQuestion(this.questionIndex);
	}

	private showQuestion(index: number) {
		this.questionContainer.empty();

		let questionType: string;

		const questionText = document.createElement("div");

		switch(this.questionType(this.questionsAndAnswers[index])) {
			case "MC":
				questionType = "MC";
				questionText.textContent = (this.questionsAndAnswers[index] as ParsedMCQ).QuestionMC;
				break;
			case "TF":
				questionType = "TF";
				questionText.textContent = (this.questionsAndAnswers[index] as ParsedTF).QuestionTF;
				break;
			case "SA":
				questionType = "SA";
				questionText.textContent = (this.questionsAndAnswers[index] as ParsedSA).QuestionSA;
				break;
			default:
				return;
		}

		this.questionContainer.appendChild(questionText);

		// Display additional UI elements based on the question type (MCQ, TF, SA)
		// You can customize this part based on your question types.

		if (questionType === "MCQ") {
			let choices: string[] = [];

			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["1"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["2"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["3"]);
			choices.push((this.questionsAndAnswers[index] as ParsedMCQ)["4"]);

			const choicesContainer = document.createElement("div");
			choices.forEach((choice, i) => {
				const choiceButton = document.createElement("button");
				choiceButton.textContent = choice;
				choiceButton.addEventListener("click", () => this.selectMCQAnswer(index, i));
				choicesContainer.appendChild(choiceButton);
			});
			this.questionContainer.appendChild(choicesContainer);
		} else if (questionType === "TF") {
			// Implement UI for True/False question
		} else if (questionType === "SA") {
			// Implement UI for Short Answer question
		} else {
			// Display UI for Error
		}

		// Update navigation buttons based on the current index
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

	private selectMCQAnswer(questionIndex: number, choiceIndex: number) {
		// Implement logic to handle user selection for MCQ
	}

	private selectTFAnswer() {
		// Implement logic to handle user selection for TF
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
