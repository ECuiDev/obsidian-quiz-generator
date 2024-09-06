import { GoogleGenerativeAI } from "@google/generative-ai";
import Generator from "../generator";
import { QuizSettings } from "../../settings/config";
import { cosineSimilarity } from "../../utils/helpers";

export default class GoogleGenerator extends Generator {
	private readonly google: GoogleGenerativeAI;

	constructor(settings: QuizSettings) {
		super(settings);
		this.google = new GoogleGenerativeAI(this.settings.googleApiKey);
	}

	public async generateQuiz(contents: string[]): Promise<string> {
		try {
			const model = this.google.getGenerativeModel(
				{
					model: this.settings.googleTextGenModel,
					systemInstruction: this.systemPrompt(),
					generationConfig: { responseMimeType: "application/json" },
				},
				{
					baseUrl: this.settings.googleBaseURL,
				}
			);
			const response = await model.generateContent(this.userPrompt(contents));

			return response.response.text();
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}

	public async shortOrLongAnswerSimilarity(userAnswer: string, answer: string): Promise<number> {
		try {
			const model = this.google.getGenerativeModel(
				{
					model: this.settings.googleEmbeddingModel,
				},
				{
					baseUrl: this.settings.googleBaseURL,
				}
			);
			const embedding = await model.batchEmbedContents({
				requests: [
					{ content: { role: "user", parts: [{ text: userAnswer }] } },
					{ content: { role: "user", parts: [{ text: answer }] } },
				],
			});

			return cosineSimilarity(embedding.embeddings[0].values, embedding.embeddings[1].values);
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
