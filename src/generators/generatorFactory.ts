import Generator from "./generator";
import { Provider } from "./providers";
import { QuizSettings } from "../settings/config";
import OpenAIGenerator from "./openai/openAIGenerator";
import GoogleGenerator from "./google/googleGenerator";
import AnthropicGenerator from "./anthropic/anthropicGenerator";
import PerplexityGenerator from "./perplexity/perplexityGenerator";
import MistralGenerator from "./mistral/mistralGenerator";
import CohereGenerator from "./cohere/cohereGenerator";
import OllamaGenerator from "./ollama/ollamaGenerator";

export default class GeneratorFactory {
	private static generatorMap: { [key in Provider]: new (settings: QuizSettings) => Generator } = {
		[Provider.OPENAI]: OpenAIGenerator,
		[Provider.GOOGLE]: GoogleGenerator,
		[Provider.ANTHROPIC]: AnthropicGenerator,
		[Provider.PERPLEXITY]: PerplexityGenerator,
		[Provider.MISTRAL]: MistralGenerator,
		[Provider.COHERE]: CohereGenerator,
		[Provider.OLLAMA]: OllamaGenerator,
	};

	public static createInstance(settings: QuizSettings): Generator {
		const provider = Provider[settings.provider as keyof typeof Provider];
		const GeneratorConstructor = this.generatorMap[provider];
		return new GeneratorConstructor(settings);
	}
}
