import { Notice } from "obsidian";
import { Mistral } from "@mistralai/mistralai";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";
import { cosineSimilarity } from "../../utils/helpers";

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

	public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
		try {
			const embedding = await this.mistral.embeddings.create({
				model: this.settings.mistralEmbeddingModel,
				inputs: [userAnswer, answer],
			});

			if (!embedding.data[0].embedding || !embedding.data[1].embedding) {
				new Notice("Error: Incomplete API response");
				return 0;
			}

			return cosineSimilarity(embedding.data[0].embedding, embedding.data[1].embedding);
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
