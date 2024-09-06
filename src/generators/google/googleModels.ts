export const enum GoogleTextGenModel {
	GEMINI_1_5_FLASH = "gemini-1.5-flash",
	GEMINI_1_5_PRO = "gemini-1.5-pro",
}

export const googleTextGenModels: Record<GoogleTextGenModel, string> = {
	[GoogleTextGenModel.GEMINI_1_5_FLASH]: "Gemini 1.5 Flash",
	[GoogleTextGenModel.GEMINI_1_5_PRO]: "Gemini 1.5 Pro",
};

export const enum GoogleEmbeddingModel {
	TEXT_EMBEDDING_004 = "text-embedding-004",
}

export const googleEmbeddingModels: Record<GoogleEmbeddingModel, string> = {
	[GoogleEmbeddingModel.TEXT_EMBEDDING_004]: "Text Embedding 004",
};
