import { Notice } from "obsidian";
import OpenAI from "openai";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";

export default class OpenAIGenerator extends Generator {
	private readonly openai: OpenAI;

	constructor(settings: QuizSettings) {
		super(settings);
		this.openai = new OpenAI({
			apiKey: this.settings.openAIApiKey,
			baseURL: this.settings.openAIBaseURL,
			dangerouslyAllowBrowser: true,
		});
	}

	public async generateQuiz(contents: string[]): Promise<string | null> {
		try {
			const response = await this.openai.chat.completions.create({
				model: this.settings.openAITextGenModel,
				messages: [
					{ role: "system", content: this.systemPrompt() },
					{ role: "user", content: this.userPrompt(contents) },
				],
				response_format: { type: "json_object" },
			});

			if (response.choices[0].finish_reason === "length") {
				new Notice("Generation truncated: Token limit reached");
			}

			return response.choices[0].message.content;
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
