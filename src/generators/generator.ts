import { QuizSettings } from "../settings/config";

export default abstract class Generator {
	protected readonly settings: QuizSettings;

	protected constructor(settings: QuizSettings) {
		this.settings = settings;
	}

	public abstract generateQuiz(contents: string[]): Promise<string | null>;

	public abstract shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number>;

	protected systemPrompt(): string {
		const trueFalseFormat = `"question": The question\n"answer": A boolean representing the answer\n`;
		const multipleChoiceFormat = `"question": The question\n"options": An array of 4 to 26 strings representing the choices\n` +
			`"answer": The number corresponding to the index of the correct answer in the options array\n`;
		const selectAllThatApplyFormat = `"question": The question\n"options": An array of 4 to 26 strings representing the choices\n` +
			`"answer": An array of numbers corresponding to the indexes of the correct answers in the options array\n`;
		const fillInTheBlankFormat = `"question": The question with 1 to 10 blanks, which must be represented by \`____\` (backticks included)\n` +
			`"answer": An array of strings corresponding to the blanks in the question\n`;
		const matchingFormat = `"question": The question\n` +
			`"answer": An array of 3 to 13 objects, each containing a leftOption property (a string that needs to be matched) and a rightOption property (a string that matches the leftOption)\n`;
		const shortOrLongAnswerFormat = `"question": The question\n"answer": The answer\n`;

		const questionFormats = [
			{ generate: this.settings.generateTrueFalse, format: trueFalseFormat, type: "true or false" },
			{ generate: this.settings.generateMultipleChoice, format: multipleChoiceFormat, type: "multiple choice" },
			{ generate: this.settings.generateSelectAllThatApply, format: selectAllThatApplyFormat, type: "select all that apply" },
			{ generate: this.settings.generateFillInTheBlank, format: fillInTheBlankFormat, type: "fill in the blank" },
			{ generate: this.settings.generateMatching, format: matchingFormat, type: "matching" },
			{ generate: this.settings.generateShortAnswer, format: shortOrLongAnswerFormat, type: "short answer" },
			{ generate: this.settings.generateLongAnswer, format: shortOrLongAnswerFormat, type: "long answer" },
		];

		const activeFormats = questionFormats
			.filter(q => q.generate)
			.map(q => `The JSON object representing ${q.type} questions must have the following properties:\n${q.format}`)
			.join("\n");

		return "You are an assistant specialized in generating exam-style questions and answers. Your response must only be a JSON object with the following property:\n" +
			`"questions": An array of JSON objects, where each JSON object represents a question and answer pair. Each question type has a different JSON object format.\n\n` +
			`${activeFormats}\nFor example, if I ask you to generate ${this.systemPromptQuestions()}, the structure of your response should look like this:\n` +
			`${this.exampleResponse()}` + (this.settings.language !== "English" ? `\n\n${this.generationLanguage()}` : "");
	}

	protected userPrompt(contents: string[]): string {
		return "Generate " + this.userPromptQuestions() + " about the following text:\n" + contents.join("") +
			"\n\nIf the above text contains LaTeX, you should use $...$ (inline math mode) for mathematical symbols. " +
			"The overall focus should be on assessing understanding and critical thinking.";
	}

	private systemPromptQuestions(): string {
		const questionTypes = [
			{ generate: this.settings.generateTrueFalse, singular: "true or false question" },
			{ generate: this.settings.generateMultipleChoice, singular: "multiple choice question" },
			{ generate: this.settings.generateSelectAllThatApply, singular: "select all that apply question" },
			{ generate: this.settings.generateFillInTheBlank, singular: "fill in the blank question" },
			{ generate: this.settings.generateMatching, singular: "matching question" },
			{ generate: this.settings.generateShortAnswer, singular: "short answer question" },
			{ generate: this.settings.generateLongAnswer, singular: "long answer question" },
		];

		const activeQuestionTypes = questionTypes.filter(q => q.generate);
		const parts = activeQuestionTypes.map(q => `1 ${q.singular}`);

		if (parts.length === 1) {
			return parts[0];
		} else if (parts.length === 2) {
			return parts.join(" and ");
		} else {
			const lastPart = parts.pop();
			return `${parts.join(", ")}, and ${lastPart}`;
		}
	}

	private userPromptQuestions(): string {
		const questionTypes = [
			{ generate: this.settings.generateTrueFalse, count: this.settings.numberOfTrueFalse, singular: "true or false question", plural: "true or false questions" },
			{ generate: this.settings.generateMultipleChoice, count: this.settings.numberOfMultipleChoice, singular: "multiple choice question", plural: "multiple choice questions" },
			{ generate: this.settings.generateSelectAllThatApply, count: this.settings.numberOfSelectAllThatApply, singular: "select all that apply question", plural: "select all that apply questions" },
			{ generate: this.settings.generateFillInTheBlank, count: this.settings.numberOfFillInTheBlank, singular: "fill in the blank question", plural: "fill in the blank questions" },
			{ generate: this.settings.generateMatching, count: this.settings.numberOfMatching, singular: "matching question", plural: "matching questions" },
			{ generate: this.settings.generateShortAnswer, count: this.settings.numberOfShortAnswer, singular: "short answer question", plural: "short answer questions" },
			{ generate: this.settings.generateLongAnswer, count: this.settings.numberOfLongAnswer, singular: "long answer question", plural: "long answer questions" },
		];

		const activeQuestionTypes = questionTypes.filter(q => q.generate);
		const parts = activeQuestionTypes.map(q => {
			if (q.count > 1) {
				return `${q.count} ${q.plural}`;
			} else {
				return `1 ${q.singular}`;
			}
		});

		if (parts.length === 1) {
			return parts[0];
		} else if (parts.length === 2) {
			return parts.join(" and ");
		} else {
			const lastPart = parts.pop();
			return `${parts.join(", ")}, and ${lastPart}`;
		}
	}

	private exampleResponse(): string {
		const trueFalseExample = `{"question": "HTML is a programming language.", "answer": false}`;
		const multipleChoiceExample = `{"question": "Which of the following is the correct translation of house in Spanish?", "options": ["Casa", "Maison", "Haus", "Huis"], "answer": 0}`;
		const selectAllThatApplyExample = `{"question": "Which of the following are elements on the periodic table?", "options": ["Oxygen", "Water", "Hydrogen", "Salt", "Carbon"], "answer": [0, 2, 4]}`;
		const fillInTheBlankExample = `{"question": "The Battle of \`____\` was fought in \`____\`.", "answer": ["Gettysburg", "1863"]}`;
		const matchingExample = `{"question": "Match the medical term to its definition.", "answer": [{"leftOption": "Hypertension", "rightOption": "High blood pressure"}, {"leftOption": "Bradycardia", "rightOption": "Slow heart rate"}, {"leftOption": "Tachycardia", "rightOption": "Fast heart rate"}, {"leftOption": "Hypotension", "rightOption": "Low blood pressure"}]}`;
		const shortAnswerExample = `{"question": "Who was the first President of the United States and what is he commonly known for?", "answer": "George Washington was the first President of the United States and is commonly known for leading the American Revolutionary War and serving two terms as president."}`;
		const longAnswerExample = `{"question": "Explain the difference between a stock and a bond, and discuss the risks and potential rewards associated with each investment type.", "answer": "A stock represents ownership in a company and a claim on part of its profits. The potential rewards include dividends and capital gains if the company's value increases, but the risks include the possibility of losing the entire investment if the company fails. A bond is a loan made to a company or government, which pays interest over time and returns the principal at maturity. Bonds are generally considered less risky than stocks, as they provide regular interest payments and the return of principal, but they offer lower potential returns."}`;

		const examples = [
			{ generate: this.settings.generateTrueFalse, example: trueFalseExample },
			{ generate: this.settings.generateMultipleChoice, example: multipleChoiceExample },
			{ generate: this.settings.generateSelectAllThatApply, example: selectAllThatApplyExample },
			{ generate: this.settings.generateFillInTheBlank, example: fillInTheBlankExample },
			{ generate: this.settings.generateMatching, example: matchingExample },
			{ generate: this.settings.generateShortAnswer, example: shortAnswerExample },
			{ generate: this.settings.generateLongAnswer, example: longAnswerExample },
		];

		const activeExamples = examples
			.filter(e => e.generate)
			.map(e => e.example)
			.join(", ");

		return `{"questions": [${activeExamples}]}`;
	}

	private generationLanguage(): string {
		return `The generated questions and answers must be in ${this.settings.language}. However, your ` +
			`response must still follow the JSON format provided above. This means that while the values should ` +
			`be in ${this.settings.language}, the keys must be the exact same as given above, in English.`;
	}
}
