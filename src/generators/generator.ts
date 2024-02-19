import QuizGenerator from "../main";

export default abstract class Generator {
	protected plugin: QuizGenerator;

	protected constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
	}

	protected systemPrompt(): string {
		return "You are an assistant specialized in generating exam-style questions " +
			"and answers. Your response must be a JSON object with the following property:\n" +
			`"quiz": An array of JSON objects, where each JSON object represents a question and answer pair. ` +
			"Each question type has a different JSON object format.\n" +
			`${this.plugin.settings.generateMultipleChoice ? "\nThe JSON object representing multiple choice " +
				"questions must have the following properties:\n" + `${this.multipleChoiceFormat()}` : ""}` +
			`${this.plugin.settings.generateTrueFalse ? "\nThe JSON object representing true/false questions " +
				"must have the following properties:\n" + `${this.trueFalseFormat()}` : ""}` +
			`${this.plugin.settings.generateShortAnswer ? "\nThe JSON object representing short answer questions " +
				"must have the following properties:\n" + `${this.shortAnswerFormat()}` : ""}` +
			"\nFor example, if I ask you to generate " + this.systemPromptQuestions() +
			" the structure of your response should look like this:\n" +
			`${this.exampleResponse()}\n` +
			`${this.generationLanguage()}`;
	}

	protected systemPromptQuestions(): string {
		if (this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			return "1 multiple choice question";
		} else if (!this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			return "1 true/false question";
		} else if (!this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			return "1 short answer question";
		} else if (this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			return "1 multiple choice question and 1 true/false question";
		} else if (this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			return "1 multiple choice question and 1 short answer question";
		} else if (!this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			return "1 true/false question and 1 short answer question";
		} else {
			return "1 multiple choice question, 1 true/false question, and 1 short answer question";
		}
	}

	protected userPromptQuestions(): string {
		if (this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfMultipleChoice > 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions`;
			} else {
				return "1 multiple choice question";
			}
		} else if (!this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfTrueFalse > 1) {
				return `${this.plugin.settings.numberOfTrueFalse} true/false questions`;
			} else {
				return "1 true/false question";
			}
		} else if (!this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfShortAnswer > 1) {
				return `${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else {
				return "1 short answer question";
			}
		} else if (this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			!this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse > 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions and ` +
					`${this.plugin.settings.numberOfTrueFalse} true/false questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse === 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions and 1 true/false question`;
			} else if (this.plugin.settings.numberOfMultipleChoice === 1 && this.plugin.settings.numberOfTrueFalse > 1) {
				return `1 multiple choice question and ${this.plugin.settings.numberOfTrueFalse} true/false questions`;
			} else {
				return `1 multiple choice question and 1 true/false question`;
			}
		} else if (this.plugin.settings.generateMultipleChoice && !this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfShortAnswer > 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions and ` +
					`${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfShortAnswer === 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions and 1 short answer question`;
			} else if (this.plugin.settings.numberOfMultipleChoice === 1 && this.plugin.settings.numberOfShortAnswer > 1) {
				return `1 multiple choice question and ${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else {
				return "1 multiple choice question and 1 short answer question";
			}
		} else if (!this.plugin.settings.generateMultipleChoice && this.plugin.settings.generateTrueFalse &&
			this.plugin.settings.generateShortAnswer) {
			if (this.plugin.settings.numberOfTrueFalse > 1 && this.plugin.settings.numberOfShortAnswer > 1) {
				return `${this.plugin.settings.numberOfTrueFalse} true/false questions and ` +
					`${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfTrueFalse > 1 && this.plugin.settings.numberOfShortAnswer === 1) {
				return `${this.plugin.settings.numberOfTrueFalse} true/false questions and 1 short answer question`;
			} else if (this.plugin.settings.numberOfTrueFalse === 1 && this.plugin.settings.numberOfShortAnswer > 1) {
				return `1 true/false question and ${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else {
				return "1 true/false question and 1 short answer question";
			}
		} else {
			if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse > 1 &&
				this.plugin.settings.numberOfShortAnswer > 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` +
					`${this.plugin.settings.numberOfTrueFalse} true/false questions, and ` +
					`${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice === 1 && this.plugin.settings.numberOfTrueFalse > 1 &&
				this.plugin.settings.numberOfShortAnswer > 1) {
				return `1 multiple choice question, ${this.plugin.settings.numberOfTrueFalse} true/false questions, ` +
					`and ${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse === 1 &&
				this.plugin.settings.numberOfShortAnswer > 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` +
					`1 true/false question, and ${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse > 1 &&
				this.plugin.settings.numberOfShortAnswer === 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` +
					`${this.plugin.settings.numberOfTrueFalse} true/false questions, and 1 short answer question`;
			} else if (this.plugin.settings.numberOfMultipleChoice === 1 && this.plugin.settings.numberOfTrueFalse === 1 &&
				this.plugin.settings.numberOfShortAnswer > 1) {
				return `1 multiple choice question, 1 true/false question, and ` +
					`${this.plugin.settings.numberOfShortAnswer} short answer questions`;
			} else if (this.plugin.settings.numberOfMultipleChoice === 1 && this.plugin.settings.numberOfTrueFalse > 1 &&
				this.plugin.settings.numberOfShortAnswer === 1) {
				return `1 multiple choice question, ${this.plugin.settings.numberOfTrueFalse} true/false questions, ` +
					`and 1 short answer question`;
			} else if (this.plugin.settings.numberOfMultipleChoice > 1 && this.plugin.settings.numberOfTrueFalse === 1 &&
				this.plugin.settings.numberOfShortAnswer === 1) {
				return `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` +
					`1 true/false question, and 1 short answer question`;
			} else {
				return "1 multiple choice question, 1 true/false question, and 1 short answer question";
			}
		}
	}

	protected multipleChoiceFormat(): string {
		return `"questionMC": The question\n"1": The first choice\n"2": The second choice\n"3": The third choice\n` +
			`"4": The fourth choice\n"answer": The number corresponding to the correct choice\n`;
	}

	protected trueFalseFormat(): string {
		return `"questionTF": The question\n"answer": A boolean representing the answer\n`;
	}

	protected shortAnswerFormat(): string {
		return `"questionSA": The question\n"answer": The answer\n`;
	}

	protected exampleResponse(): string {
		const multipleChoiceExample = `{"questionMC": "What is the capital city of Australia?", ` +
			`"1": "Sydney", "2": "Melbourne", "3": "Canberra", "4": "Brisbane", "answer": 3}`;

		const trueFalseExample = `{"questionTF": "The Great Wall of China is visible from space.", ` +
			`"answer": false}`;

		const shortAnswerExample = `{"questionSA": "Explain the concept of photosynthesis in plants.", ` +
			`"answer": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light ` +
			`energy into chemical energy, stored in the form of glucose or other organic compounds. It occurs in the ` +
			`chloroplasts of cells and involves the absorption of light by chlorophyll, the conversion of carbon ` +
			`dioxide and water into glucose, and the release of oxygen as a byproduct."}`;

		return `{"quiz": [` +
			`${this.plugin.settings.generateMultipleChoice ? `${multipleChoiceExample}` : ""}` +
			`${this.plugin.settings.generateTrueFalse ? `${this.plugin.settings.generateMultipleChoice ?
				`, ${trueFalseExample}` : `${trueFalseExample}`}` : ""}` +
			`${this.plugin.settings.generateShortAnswer ?
				`${this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse ?
					`, ${shortAnswerExample}` : `${shortAnswerExample}`}` : ""}` + `]}`;
	}

	protected generationLanguage(): string {
		return `The generated questions and answers must be in ${this.plugin.settings.language}. However, your ` +
			`response must still follow the JSON format provided above. This means that while the values should ` +
			`be in ${this.plugin.settings.language}, the keys must be the exact same as given above, in English.`;
	}

}
