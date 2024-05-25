import { Notice } from "obsidian";
import OpenAI from "openai";
import QuizGenerator from "../main";
import Generator from "./generator";

export default class GptGenerator extends Generator {
	private openai: OpenAI;

	constructor(plugin: QuizGenerator) {
		super(plugin);
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey,
			dangerouslyAllowBrowser: true});
	}

	public async generateQuestions(contents: string[]): Promise<string | undefined> {
		try {
			const completion = await this.openai.chat.completions.create({
				messages: [
					{ role: "system", content: this.systemPrompt() },
					{ role: "user", content: "Generate " + this.userPromptQuestions() +
							" based off the following text:\n" + contents.join('') +
							"\nThe overall focus should be on assessing understanding and critical thinking."}
				],
				model: this.plugin.settings.model,
				response_format: { type: "json_object" },
			});

			if (completion.choices[0].finish_reason === "length") {
				new Notice("Generation truncated: Request token limit reached");
			}

			return completion.choices[0].message.content?.replace(/```json\n?|```/g, "");
		} catch (error: any) {
			new Notice(error);
		}
	}

}
