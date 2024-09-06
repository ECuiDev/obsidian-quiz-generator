import { Notice } from "obsidian";
import OpenAI from "openai";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";

export default class PerplexityGenerator extends Generator {
	private readonly perplexity: OpenAI;

	constructor(settings: QuizSettings) {
		super(settings);
		this.perplexity = new OpenAI({
			apiKey: this.settings.perplexityApiKey,
			baseURL: this.settings.perplexityBaseURL,
			dangerouslyAllowBrowser: true,
		});
	}

	public async generateQuiz(contents: string[]): Promise<string | null> {
		try {
			const response = await this.perplexity.chat.completions.create({
				model: this.settings.perplexityTextGenModel,
				messages: [
					{ role: "system", content: this.systemPrompt() },
					{ role: "user", content: this.userPrompt(contents) },
				],
			});

			if (response.choices[0].finish_reason === "length") {
				new Notice("Generation truncated: Token limit reached");
			}

			return response.choices[0].message.content;
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}

	public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
		throw new Error("Perplexity does not support grading short and long answer questions. Please switch to a provider that offers embedding models.");
	}
}
