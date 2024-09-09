import { Ollama } from "ollama/dist/browser.mjs";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";
import { cosineSimilarity } from "../../utils/helpers";

export default class OllamaGenerator extends Generator {
	private readonly ollama: Ollama;

	constructor(settings: QuizSettings) {
		super(settings);
		this.ollama = new Ollama({ host: this.settings.ollamaBaseURL });
	}

	public async generateQuiz(contents: string[]): Promise<string> {
		try {
			const response = await this.ollama.generate({
				model: this.settings.ollamaTextGenModel,
				system: this.systemPrompt(),
				prompt: this.userPrompt(contents),
				format: "json",
				stream: false,
			});

			return response.response;
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}

	public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
		try {
			const embedding = await this.ollama.embed({
				model: this.settings.ollamaEmbeddingModel,
				input: [userAnswer, answer],
			});

			return cosineSimilarity(embedding.embeddings[0], embedding.embeddings[1]);
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
