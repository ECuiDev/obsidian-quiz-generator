import { PerplexityTextGenModel } from "../../../generators/perplexity/perplexityModels";

export interface PerplexityConfig {
	perplexityApiKey: string;
	perplexityBaseURL: string;
	perplexityTextGenModel: string;
}

export const DEFAULT_PERPLEXITY_SETTINGS: PerplexityConfig = {
	perplexityApiKey: "",
	perplexityBaseURL: "https://api.perplexity.ai",
	perplexityTextGenModel: PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_CHAT,
};
