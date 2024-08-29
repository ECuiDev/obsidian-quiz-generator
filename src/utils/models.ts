export enum Provider {
	OPENAI = "OPENAI",
	GOOGLE = "GOOGLE",
	ANTHROPIC = "ANTHROPIC",
	PERPLEXITY = "PERPLEXITY",
}

export const providers: Record<Provider, string> = {
	[Provider.OPENAI]: "OpenAI",
	[Provider.GOOGLE]: "Google",
	[Provider.ANTHROPIC]: "Anthropic",
	[Provider.PERPLEXITY]: "Perplexity",
};

export const enum OpenAITextGenModel {
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4o_MINI = "gpt-4o-mini",
	GPT_4o = "gpt-4o",
}

export const openAITextGenModels: Record<OpenAITextGenModel, string> = {
	[OpenAITextGenModel.GPT_3_5_TURBO]: "GPT-3.5 Turbo",
	[OpenAITextGenModel.GPT_4_TURBO]: "GPT-4 Turbo",
	[OpenAITextGenModel.GPT_4o_MINI]: "GPT-4o Mini",
	[OpenAITextGenModel.GPT_4o]: "GPT-4o"
};

export const enum GoogleTextGenModel {
	GEMINI_1_5_FLASH = "gemini-1.5-flash",
	GEMINI_1_5_PRO = "gemini-1.5-pro",
}

export const googleTextGenModels: Record<GoogleTextGenModel, string> = {
	[GoogleTextGenModel.GEMINI_1_5_FLASH]: "Gemini 1.5 Flash",
	[GoogleTextGenModel.GEMINI_1_5_PRO]: "Gemini 1.5 Pro",
};

export const enum AnthropicTextGenModel {
	CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
	CLAUDE_3_SONNET = "claude-3-sonnet-20240229",
	CLAUDE_3_OPUS = "claude-3-opus-20240229",
	CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20240620",
}

export const anthropicTextGenModels: Record<AnthropicTextGenModel, string> = {
	[AnthropicTextGenModel.CLAUDE_3_HAIKU]: "Claude 3 Haiku",
	[AnthropicTextGenModel.CLAUDE_3_SONNET]: "Claude 3 Sonnet",
	[AnthropicTextGenModel.CLAUDE_3_OPUS]: "Claude 3 Opus",
	[AnthropicTextGenModel.CLAUDE_3_5_SONNET]: "Claude 3.5 Sonnet",
};

export const enum PerplexityTextGenModel {
	LLAMA_3_1_SONAR_SMALL_ONLINE = "llama-3.1-sonar-small-128k-online",
	LLAMA_3_1_SONAR_LARGE_ONLINE = "llama-3.1-sonar-large-128k-online",
	LLAMA_3_1_SONAR_HUGE_ONLINE = "llama-3.1-sonar-huge-128k-online",
	LLAMA_3_1_SONAR_SMALL_CHAT = "llama-3.1-sonar-small-128k-chat",
	LLAMA_3_1_SONAR_LARGE_CHAT = "llama-3.1-sonar-large-128k-chat",
	LLAMA_3_1_8B_INSTRUCT = "llama-3.1-8b-instruct",
	LLAMA_3_1_70B_INSTRUCT = "llama-3.1-70b-instruct",
}

export const perplexityTextGenModels: Record<PerplexityTextGenModel, string> = {
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_ONLINE]: "Llama 3.1 Sonar Small Online",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_LARGE_ONLINE]: "Llama 3.1 Sonar Large Online",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_HUGE_ONLINE]: "Llama 3.1 Sonar Huge Online",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_CHAT]: "Llama 3.1 Sonar Small Chat",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_LARGE_CHAT]: "Llama 3.1 Sonar Large Chat",
	[PerplexityTextGenModel.LLAMA_3_1_8B_INSTRUCT]: "Llama 3.1 8B Instruct",
	[PerplexityTextGenModel.LLAMA_3_1_70B_INSTRUCT]: "Llama 3.1 70B Instruct",
};
