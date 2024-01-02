import { Notice } from "obsidian";
import OpenAI from "openai";
import QuizGenerator from "../main";

export default class GptService {
	private plugin: QuizGenerator;
	openai: OpenAI;
	private choices = ["Choice1", "Choice2", "Choice3", "Choice4"];

	constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey, dangerouslyAllowBrowser: true})
	}

	async generateQuestions(contents: string[]) {
		try {
			console.log("Making API request...");
			const notice = new Notice("Making API request...");
			const completion = await this.openai.chat.completions.create({
				messages: [
					{ role: "system", content: "You are an assistant specialized in generating questions and " +
						"answers. Provide your response as an array of JSON objects, where each element of the array " +
							"is a JSON object that represents a question/answer pair. Here are the question types and " +
							"their corresponding JSON object format."
						+ (this.plugin.settings.generateMultipleChoice ? this.formatMultipleChoice() + "\n\n" : "")
						+ (this.plugin.settings.generateTrueFalse ? this.formatTrueFalse() + "\n\n" : "")
						+ (this.plugin.settings.generateShortAnswer ? this.formatShortAnswer() + "\n\n" : "") },
					{ role: "user", content: (this.plugin.settings.generateMultipleChoice
								? `generate ${this.plugin.settings.numberOfMultipleChoice} multiple choice questions, ` : "")
							+ (this.plugin.settings.generateTrueFalse
								? `generate ${this.plugin.settings.numberOfTrueFalse} true/false questions, ` : "")
							+ (this.plugin.settings.generateShortAnswer
								? `generate ${this.plugin.settings.numberOfShortAnswer} short answer questions, ` : "")
							+ "based off the following text: " + contents.join('') +
							" The overall focus should be on assessing understanding and critical thinking."}
				],
				model: "gpt-3.5-turbo-1106",
				response_format: { type: "json_object" },
			});
			notice.hide();
			console.log("API request successful:", completion.choices[0].message.content);
			console.log(completion.usage?.total_tokens);
			return completion.choices[0].message.content;
		} catch (e) {
			console.error("API request failed:", e);
			new Notice("Error generating quiz. Did you set your API key in the settings?", 5000);
		}
	}

	private formatMultipleChoice() {


		return `For multiple choice questions, return a JSON object with the following structure:
			- Q: The question
			- A: The first choice
			- B: The second choice
			- C: The third choice
			- D: The fourth choice
			- AMC: The letter corresponding to the correct choice
			
			Example:
			{
			  "Q": "What is the capital city of Australia?",
			  "A": "Sydney",
			  "B": "Melbourne",
			  "C": "Canberra",
			  "D": "Brisbane",
			  "AMC": C
			}`
	}

	private formatTrueFalse() {
		return `For true/false questions, return a JSON object with the following structure:
			- Q: The question
			- ATF: The correct answer to the question
			
			Example:
			{
			  "Q": "The Great Wall of China is visible from space.",
			  "ATF": False
			}`
	}

	private formatShortAnswer() {
		return `For short answer questions, return a JSON object with the following structure:
			- Q: The question
			- ASA: The correct answer to the question
			
			Example:
			{
			  "Q": "Explain the concept of photosynthesis in plants.",
			  "ATF": "Photosynthesis is the process by which green plants, algae, and some bacteria convert light 
			  energy into chemical energy, stored in the form of glucose or other organic compounds. It occurs in the 
			  chloroplasts of cells and involves the absorption of light by chlorophyll, the conversion of carbon 
			  dioxide and water into glucose, and the release of oxygen as a byproduct."
			}`
	}

}
