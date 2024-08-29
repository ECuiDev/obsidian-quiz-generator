import { AnthropicTextGenModel } from "../../../generators/anthropic/anthropicModels";

export interface AnthropicConfig {
	anthropicApiKey: string;
	anthropicBaseURL: string;
	anthropicTextGenModel: string;
}

export const DEFAULT_ANTHROPIC_SETTINGS: AnthropicConfig = {
	anthropicApiKey: "",
	anthropicBaseURL: "https://api.anthropic.com",
	anthropicTextGenModel: AnthropicTextGenModel.CLAUDE_3_HAIKU,
};
