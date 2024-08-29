import { PerplexityTextGenModel } from "../../generators/perplexity/perplexityModels";

export interface PerplexityConfig {
	perplexityApiKey: string;
	perplexityTextGenModel: string;
}

export const DEFAULT_PERPLEXITY_SETTINGS: PerplexityConfig = {
	perplexityApiKey: "",
	perplexityTextGenModel: PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_ONLINE,
};
