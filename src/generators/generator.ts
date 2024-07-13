import { QuizSettings } from "../utils/types";

export default abstract class Generator {
	protected readonly settings: QuizSettings;

	protected constructor(settings: QuizSettings) {
		this.settings = settings;
	}

	protected systemPrompt(): string {
		const questionFormats = [
			{ generate: this.settings.generateMultipleChoice, format: this.multipleChoiceFormat(), type: "multiple choice" },
			{ generate: this.settings.generateTrueFalse, format: this.trueFalseFormat(), type: "true/false" },
			{ generate: this.settings.generateShortAnswer, format: this.shortAnswerFormat(), type: "short answer" },
		];

		const activeFormats = questionFormats
			.filter(q => q.generate)
			.map(q => `The JSON object representing ${q.type} questions must have the following properties:\n${q.format}`)
			.join("\n");

		return "You are an assistant specialized in generating exam-style questions and answers. Your response must be a JSON object with the following property:\n" +
			`"quiz": An array of JSON objects, where each JSON object represents a question and answer pair. Each question type has a different JSON object format.\n` +
			`${activeFormats}\n` +
			`For example, if I ask you to generate ${this.systemPromptQuestions()} the structure of your response should look like this:\n` +
			`${this.exampleResponse()}\n` +
			`${this.generationLanguage()}`;
	}

	protected systemPromptQuestions(): string {
		const questionTypes = [
			{ generate: this.settings.generateMultipleChoice, singular: "multiple choice question" },
			{ generate: this.settings.generateTrueFalse, singular: "true/false question" },
			{ generate: this.settings.generateShortAnswer, singular: "short answer question" },
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

	protected userPromptQuestions(): string {
		const questionTypes = [
			{ generate: this.settings.generateMultipleChoice, count: this.settings.numberOfMultipleChoice, singular: "multiple choice question", plural: "multiple choice questions" },
			{ generate: this.settings.generateTrueFalse, count: this.settings.numberOfTrueFalse, singular: "true/false question", plural: "true/false questions" },
			{ generate: this.settings.generateShortAnswer, count: this.settings.numberOfShortAnswer, singular: "short answer question", plural: "short answer questions" },
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

		const examples = [
			{ generate: this.settings.generateMultipleChoice, example: multipleChoiceExample },
			{ generate: this.settings.generateTrueFalse, example: trueFalseExample },
			{ generate: this.settings.generateShortAnswer, example: shortAnswerExample },
		];

		const activeExamples = examples
			.filter(e => e.generate)
			.map(e => e.example)
			.join(", ");

		return `{"quiz": [${activeExamples}]}`;
	}

	protected generationLanguage(): string {
		return `The generated questions and answers must be in ${this.settings.language}. However, your ` +
			`response must still follow the JSON format provided above. This means that while the values should ` +
			`be in ${this.settings.language}, the keys must be the exact same as given above, in English.`;
	}
}
