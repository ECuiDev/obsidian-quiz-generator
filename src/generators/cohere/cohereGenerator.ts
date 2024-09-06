import { Notice } from "obsidian";
import { CohereClient } from "cohere-ai/Client";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";
import { cosineSimilarity } from "../../utils/helpers";

export default class CohereGenerator extends Generator {
	private readonly cohere: CohereClient;

	constructor(settings: QuizSettings) {
		super(settings);
		this.cohere = new CohereClient({
			token: this.settings.cohereApiKey,
			environment: this.settings.cohereBaseURL,
		});
	}

	public async generateQuiz(contents: string[]): Promise<string> {
		try {
			const response = await this.cohere.chat({
				model: this.settings.cohereTextGenModel,
				preamble: this.systemPrompt(),
				message: this.userPrompt(contents),
				responseFormat: { type: "json_object" },
			});

			if (response.finishReason === "MAX_TOKENS") {
				new Notice("Generation truncated: Token limit reached");
			}

			return response.text;
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}

	public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
		try {
			const embedding = await this.cohere.embed({
				model: this.settings.cohereEmbeddingModel,
				texts: [userAnswer, answer],
				inputType: "classification",
			});

			return cosineSimilarity((embedding.embeddings as number[][])[0], (embedding.embeddings as number[][])[1]);
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
