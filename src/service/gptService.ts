import { Notice } from "obsidian";
import OpenAI from "openai";
import QuizGenerator from "../main";

export default class GptService {
	private plugin: QuizGenerator;
	openai: OpenAI;

	constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey})
	}

	async generateQuestions(contents: string[]) {
		try {
			const completion = await this.openai.chat.completions.create({
				messages: [{ role: "system", content: "You are an assistant specialized in generating questions and " +
						"answers. Precede each question and answer with Q: and A: respectively." },
					{ role: "user", content: (this.plugin.settings.generateMultipleChoice
								? `generate ${this.plugin.settings.numberOfMultipleChoice} multiple choice questions,` : "")
							+ (this.plugin.settings.generateTrueFalse
								? `generate ${this.plugin.settings.numberOfTrueFalse} true/false questions,` : "")
							+ (this.plugin.settings.generateShortAnswer
								? `generate ${this.plugin.settings.numberOfShortAnswer} short answer questions,` : "")
							+ "based off the following text: " + `...${contents}` +
							"The overall focus should be on assessing understanding and critical thinking."}
				],
				model: "gpt-3.5-turbo-1106"
			});
			console.log(completion.choices[0].message.content);
			return completion.choices[0].message.content;
		} catch (e) {
			new Notice("Error generating quiz. Did you set your API key in the settings?", 5000);
		}
	}

}
