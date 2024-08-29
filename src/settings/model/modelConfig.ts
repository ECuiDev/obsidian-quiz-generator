import { Provider } from "../../generators/providers";
import { DEFAULT_OPENAI_SETTINGS, OpenAIConfig } from "./openAIConfig";
import { DEFAULT_GOOGLE_SETTINGS, GoogleConfig } from "./googleConfig";
import { AnthropicConfig, DEFAULT_ANTHROPIC_SETTINGS } from "./anthropicConfig";
import { DEFAULT_PERPLEXITY_SETTINGS, PerplexityConfig } from "./perplexityConfig";

export interface ModelConfig extends OpenAIConfig, GoogleConfig, AnthropicConfig, PerplexityConfig {
	provider: string;
}

export const DEFAULT_MODEL_SETTINGS: ModelConfig = {
	provider: Provider.OPENAI,
	...DEFAULT_OPENAI_SETTINGS,
	...DEFAULT_GOOGLE_SETTINGS,
	...DEFAULT_ANTHROPIC_SETTINGS,
	...DEFAULT_PERPLEXITY_SETTINGS,
};
