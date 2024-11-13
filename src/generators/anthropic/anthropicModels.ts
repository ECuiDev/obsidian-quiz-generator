export const enum AnthropicTextGenModel {
	CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
	CLAUDE_3_SONNET = "claude-3-sonnet-20240229",
	CLAUDE_3_OPUS = "claude-3-opus-20240229",
	CLAUDE_3_5_HAIKU = "claude-3-5-haiku-20241022",
	CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20241022",
}

export const anthropicTextGenModels: Record<AnthropicTextGenModel, string> = {
	[AnthropicTextGenModel.CLAUDE_3_HAIKU]: "Claude 3 Haiku",
	[AnthropicTextGenModel.CLAUDE_3_SONNET]: "Claude 3 Sonnet",
	[AnthropicTextGenModel.CLAUDE_3_OPUS]: "Claude 3 Opus",
	[AnthropicTextGenModel.CLAUDE_3_5_HAIKU]: "Claude 3.5 Haiku",
	[AnthropicTextGenModel.CLAUDE_3_5_SONNET]: "Claude 3.5 Sonnet",
};
