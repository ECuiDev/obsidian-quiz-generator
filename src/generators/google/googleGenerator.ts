import { GoogleGenerativeAI } from "@google/generative-ai";
import Generator from "../generator";
import { QuizSettings } from "../../utils/types";

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
				},
			);
			const response = await model.generateContent(this.userPrompt(contents));

			return response.response.text();
		} catch (error) {
			throw new Error((error as Error).message);
		}
	}
}
