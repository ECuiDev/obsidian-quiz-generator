import { Notice } from "obsidian";
import { Mistral } from "@mistralai/mistralai";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";

export default class MistralGenerator extends Generator {
	private readonly mistral: Mistral;

	constructor(settings: QuizSettings) {
		super(settings);
		this.mistral = new Mistral({
			apiKey: this.settings.mistralApiKey,
			serverURL: this.settings.mistralBaseURL,
		});
	}

	public async generateQuiz(contents: string[]): Promise<string | null> {
		try {
			const response = await this.mistral.chat.complete({
				model: this.settings.mistralTextGenModel,
				messages: [
					{ role: "system", content: this.systemPrompt() },
					{ role: "user", content: this.userPrompt(contents) },
				],
				responseFormat: { type: "json_object" },
			});

			if (!response.choices || !response.choices[0].message.content) {
				return null;
			}

			if (response.choices[0].finishReason === "length" || response.choices[0].finishReason === "model_length") {
				new Notice("Generation truncated: Token limit reached");
			}

			return response.choices[0].message.content;
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
