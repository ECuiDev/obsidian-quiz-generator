import {Notice} from "obsidian";
import OpenAI from "openai";
import QuizGenerator from "../main";

export default class GptService {
	private plugin: QuizGenerator;
	private openai: OpenAI;

	constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey,
			dangerouslyAllowBrowser: true});
	}

	async generateQuestions(contents: string[]) {
		try {
			const systemPrompt = "You are an assistant specialized in generating exam-style questions " +
				"and answers. Your response must be a JSON object with the following property:\n" +
				`"quiz": an array of JSON objects, where each JSON object represents a question and answer pair. ` +
				"Each question type has a different JSON object format.\n" +
				`${this.plugin.settings.generateMultipleChoice ? "\nThe JSON object representing multiple choice " +
					"questions must have the following properties:\n" + `${this.multipleChoiceFormat()}` : ""}` +
				`${this.plugin.settings.generateTrueFalse ? "\nThe JSON object representing true/false questions " +
					"must have the following properties:\n" + `${this.trueFalseFormat()}` : ""}` +
				`${this.plugin.settings.generateShortAnswer ? "\nThe JSON object representing short answer questions " +
					"must have the following properties:\n" + `${this.shortAnswerFormat()}` : ""}` +
				"\nFor example, if I ask you to generate 1 multiple choice question, 1 true/false question, and 1 " +
				"short answer question, the structure of your response should look like this:\n" +
				`${this.exampleResponse()}`;

			console.log("Making API request...");
			new Notice("Making API request...");
			const completion = await this.openai.chat.completions.create({
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: "Generate " +
							(this.plugin.settings.generateMultipleChoice
								? `${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` : "")
							+ (this.plugin.settings.generateTrueFalse
								? `${this.plugin.settings.numberOfTrueFalse} true/false questions, ` : "")
							+ (this.plugin.settings.generateShortAnswer
								? `${this.plugin.settings.numberOfShortAnswer} short answer questions, ` : "")
							+ "based off the following text:\n" + contents.join('') +
							"\nThe overall focus should be on assessing understanding and critical thinking."}
				],
				model: "gpt-3.5-turbo-1106",
				response_format: { type: "json_object" },
			});
			console.log("API request successful: ", completion.choices[0].message.content);
			console.log(completion.usage?.total_tokens);
			return completion.choices[0].message.content;
		} catch (e) {
			console.error("API request failed:", e);
			new Notice("Error generating quiz. Did you set your API key in the settings?", 5000);
		}
	}

	private multipleChoiceFormat() {
		return `"QuestionMC": The question\n"1": The first choice\n"2": The second choice\n"3": The third choice\n` +
		`"4": The fourth choice\n"Answer": The number corresponding to the correct choice\n`;
	}

	private trueFalseFormat() {
		return `"QuestionTF": The question\n"Answer": A boolean representing the answer\n`;
	}

	private shortAnswerFormat() {
		return `"QuestionSA": The question\n"Answer": The answer\n`;
	}

	exampleResponse() {
		const multipleChoiceExample = `{"QuestionMC": "What is the capital city of Australia?", ` +
			`"1": "Sydney", "2": "Melbourne", "3": "Canberra", "4": "Brisbane", "Answer": 3}`;

		const trueFalseExample = `{"QuestionTF": "The Great Wall of China is visible from space.", ` +
			`"Answer": false}`;

		const shortAnswerExample = `{"QuestionSA": "Explain the concept of photosynthesis in plants.", ` +
			`"Answer": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light ` +
			`energy into chemical energy, stored in the form of glucose or other organic compounds. It occurs in the ` +
			`chloroplasts of cells and involves the absorption of light by chlorophyll, the conversion of carbon ` +
			`dioxide and water into glucose, and the release of oxygen as a byproduct."}`;

		return `{"quiz": [${multipleChoiceExample}, ${trueFalseExample}, ${shortAnswerExample}]}`;
	}

}
