import Generator from "./generator";
import OpenAIGenerator from "./openAIGenerator";
import GoogleGenerator from "./googleGenerator";
import AnthropicGenerator from "./anthropicGenerator";
import PerplexityGenerator from "./perplexityGenerator";
import { QuizSettings } from "../utils/types";
import { Provider } from "../utils/models";

export default class GeneratorFactory {
	private static generatorMap: { [key in Provider]: new (settings: QuizSettings) => Generator } = {
		[Provider.OPENAI]: OpenAIGenerator,
		[Provider.GOOGLE]: GoogleGenerator,
		[Provider.ANTHROPIC]: AnthropicGenerator,
		[Provider.PERPLEXITY]: PerplexityGenerator,
	};

	public static createInstance(settings: QuizSettings): Generator {
		const provider = Provider[settings.provider as keyof typeof Provider];
		const GeneratorConstructor = this.generatorMap[provider];
		return new GeneratorConstructor(settings);
	}
}
