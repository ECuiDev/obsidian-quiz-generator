import { Provider } from "../../generators/providers";
import { DEFAULT_OPENAI_SETTINGS, OpenAIConfig } from "./openai/openAIConfig";
import { DEFAULT_GOOGLE_SETTINGS, GoogleConfig } from "./google/googleConfig";
import { AnthropicConfig, DEFAULT_ANTHROPIC_SETTINGS } from "./anthropic/anthropicConfig";
import { DEFAULT_PERPLEXITY_SETTINGS, PerplexityConfig } from "./perplexity/perplexityConfig";
import { DEFAULT_MISTRAL_SETTINGS, MistralConfig } from "./mistral/mistralConfig";

export interface ModelConfig extends OpenAIConfig, GoogleConfig, AnthropicConfig, PerplexityConfig, MistralConfig {
	provider: string;
}

export const DEFAULT_MODEL_SETTINGS: ModelConfig = {
	provider: Provider.OPENAI,
	...DEFAULT_OPENAI_SETTINGS,
	...DEFAULT_GOOGLE_SETTINGS,
	...DEFAULT_ANTHROPIC_SETTINGS,
	...DEFAULT_PERPLEXITY_SETTINGS,
	...DEFAULT_MISTRAL_SETTINGS,
};
