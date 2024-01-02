import { Notice } from "obsidian";
import OpenAI from "openai";
import QuizGenerator from "../main";
import { cleanUpPrompt } from "../utils/parser";

export default class GptService {
	private plugin: QuizGenerator;
	openai: OpenAI;

	constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey,
			dangerouslyAllowBrowser: true});
	}

	async generateQuestions(contents: string[]) {
		try {
			const systemPrompt = `You are an assistant specialized in generating exam-style questions and 
			answers. Your response must be a JSON object with the following property:
			"quiz": an array of JSON objects, where each JSON object represents a question and answer pair. Each type of 
			question is represented by a different JSON object format. ${this.plugin.settings.generateMultipleChoice ? 
				`The JSON object for multiple choice questions must have the following properties:
				${this.multipleChoiceFormat()}` : ""}. ${this.plugin.settings.generateTrueFalse ? `The JSON object for 
				true/false questions must have the following properties: ${this.trueFalseFormat()}` : ""} 
				${this.plugin.settings.generateShortAnswer ? `The JSON object for short answer questions must have the 
				following properties: ${this.shortAnswerFormat()}` : ""} For example, if I ask you to generate 1 
				multiple choice question, 1 true/false question, and 1 short answer question, the structure of your 
				response should look like this: ${this.exampleResponse()}`;

			console.log(systemPrompt);
			console.log(JSON.stringify(systemPrompt));
			console.log(cleanUpPrompt(systemPrompt));
			console.log(JSON.stringify(cleanUpPrompt(systemPrompt)));

			/*console.log("Making API request...");
			new Notice("Making API request...");
			const completion = await this.openai.chat.completions.create({
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: (this.plugin.settings.generateMultipleChoice
								? `generate ${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` : "")
							+ (this.plugin.settings.generateTrueFalse
								? `generate ${this.plugin.settings.numberOfTrueFalse} true/false questions, ` : "")
							+ (this.plugin.settings.generateShortAnswer
								? `generate ${this.plugin.settings.numberOfShortAnswer} short answer questions, ` : "")
							+ "based off the following text: " + contents.join('') +
							"The overall focus should be on assessing understanding and critical thinking."}
				],
				model: "gpt-3.5-turbo-1106",
				response_format: { type: "json_object" },
			});
			console.log("API request successful: ", completion.choices[0].message.content);
			console.log(completion.usage?.total_tokens);
			return completion.choices[0].message.content;*/

			return "temp";
		} catch (e) {
			console.error("API request failed:", e);
			new Notice("Error generating quiz. Did you set your API key in the settings?", 5000);
		}
	}

	private multipleChoiceFormat() {
		return `"Q": The question
		"A": The first choice
		"B": The second choice
		"C": The third choice
		"D": The fourth choice
		"AMC": The letter corresponding to the correct choice`;
	}

	private trueFalseFormat() {
		return `"Q": The question "ATF": The answer`;
	}

	private shortAnswerFormat() {
		return `"Q": The question "ASA": The answer`;
	}

	private exampleResponse() {
		const multipleChoiceExample = `{
		  "Q": "What is the capital city of Australia?",
		  "A": "Sydney",
		  "B": "Melbourne",
		  "C": "Canberra",
		  "D": "Brisbane",
		  "AMC": "C"
		}`;

		const trueFalseExample = `{
		  "Q": "The Great Wall of China is visible from space.",
		  "ATF": "False"
		}`;

		const shortAnswerExample = `{
		  "Q": "Explain the concept of photosynthesis in plants.",
		  "ASA": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light 
		  energy into chemical energy, stored in the form of glucose or other organic compounds. It occurs in the 
		  chloroplasts of cells and involves the absorption of light by chlorophyll, the conversion of carbon 
		  dioxide and water into glucose, and the release of oxygen as a byproduct."
		}`;

		const example = `{
		  "quiz": [
		  ${multipleChoiceExample},
		  ${trueFalseExample},
		  ${shortAnswerExample}
		  ]
		}`;

		return cleanUpPrompt(example);
	}

}
