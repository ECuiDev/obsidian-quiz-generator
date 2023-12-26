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
			const completion = await this.openai.chat.completions.create({
				messages: [{ role: "system", content: "You are an assistant specialized in generating questions and " +
						"answers.\n\n"
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
				model: "gpt-3.5-turbo-1106"
			});
			console.log(completion.choices[0].message.content);
			return completion.choices[0].message.content;
		} catch (e) {
			new Notice("Error generating quiz. Did you set your API key in the settings?", 5000);
		}
	}

	private formatMultipleChoice() {
		const formattedChoices = this.choices.map((choice, index) =>
			`${String.fromCharCode(97 + index)}) ${choice}`).join('\n');
		return `Multiple Choice Format\nQ: Question\n${formattedChoices}\nA: Answer`;
	}

	private formatTrueFalse() {
		return "True/False Format\nQ: Question\nA: True or False";
	}

	private formatShortAnswer() {
		return "Short Answer Format\nQ: Question\nA: Answer";
	}

}
