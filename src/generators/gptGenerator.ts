import { Notice } from "obsidian";
import OpenAI from "openai";
import Generator from "./generator";
import { QuizSettings } from "../utils/types";

export default class GptGenerator extends Generator {
	private openai: OpenAI;

	constructor(settings: QuizSettings) {
		super(settings);
		this.openai = new OpenAI({
			apiKey: this.settings.apiKey,
			baseURL: this.settings.apiBaseURL,
			dangerouslyAllowBrowser: true,
		});
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
				model: this.settings.model,
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
