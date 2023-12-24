import OpenAI from "openai";
import QuizGenerator from "../main";

export default class GptService {
	private plugin: QuizGenerator;
	openai: OpenAI;

	constructor(plugin: QuizGenerator) {
		this.plugin = plugin;
		this.openai = new OpenAI({apiKey: this.plugin.settings.apiKey});
	}

	async generateQuestions() {

	}

}

interface GPTQuestionGenerationParams {

}
