export const enum PerplexityTextGenModel {
	LLAMA_3_1_SONAR_SMALL_CHAT = "llama-3.1-sonar-small-128k-chat",
	LLAMA_3_1_SONAR_LARGE_CHAT = "llama-3.1-sonar-large-128k-chat",
	LLAMA_3_1_SONAR_SMALL_ONLINE = "llama-3.1-sonar-small-128k-online",
	LLAMA_3_1_SONAR_LARGE_ONLINE = "llama-3.1-sonar-large-128k-online",
	LLAMA_3_1_SONAR_HUGE_ONLINE = "llama-3.1-sonar-huge-128k-online",
	LLAMA_3_1_8B_INSTRUCT = "llama-3.1-8b-instruct",
	LLAMA_3_1_70B_INSTRUCT = "llama-3.1-70b-instruct",
}

export const perplexityTextGenModels: Record<PerplexityTextGenModel, string> = {
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_CHAT]: "Llama 3.1 Sonar Small Chat",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_LARGE_CHAT]: "Llama 3.1 Sonar Large Chat",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_ONLINE]: "Llama 3.1 Sonar Small Online",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_LARGE_ONLINE]: "Llama 3.1 Sonar Large Online",
	[PerplexityTextGenModel.LLAMA_3_1_SONAR_HUGE_ONLINE]: "Llama 3.1 Sonar Huge Online",
	[PerplexityTextGenModel.LLAMA_3_1_8B_INSTRUCT]: "Llama 3.1 8B Instruct",
	[PerplexityTextGenModel.LLAMA_3_1_70B_INSTRUCT]: "Llama 3.1 70B Instruct",
};
