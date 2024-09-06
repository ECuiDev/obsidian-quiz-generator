export const enum CohereTextGenModel {
	COMMAND_R = "command-r-08-2024",
	COMMAND_R_PLUS = "command-r-plus-08-2024",
}

export const cohereTextGenModels: Record<CohereTextGenModel, string> = {
	[CohereTextGenModel.COMMAND_R]: "Command R",
	[CohereTextGenModel.COMMAND_R_PLUS]: "Command R+",
};

export const enum CohereEmbeddingModel {
	EMBED_ENGLISH_LIGHT_3_0 = "embed-english-light-v3.0",
	EMBED_ENGLISH_3_0 = "embed-english-v3.0",
	EMBED_MULTILINGUAL_LIGHT_3_0 = "embed-multilingual-light-v3.0",
	EMBED_MULTILINGUAL_3_0 = "embed-multilingual-v3.0",
}

export const cohereEmbeddingModels: Record<CohereEmbeddingModel, string> = {
	[CohereEmbeddingModel.EMBED_ENGLISH_LIGHT_3_0]: "Embed English Light 3.0",
	[CohereEmbeddingModel.EMBED_ENGLISH_3_0]: "Embed English 3.0",
	[CohereEmbeddingModel.EMBED_MULTILINGUAL_LIGHT_3_0]: "Embed Multilingual Light 3.0",
	[CohereEmbeddingModel.EMBED_MULTILINGUAL_3_0]: "Embed Multilingual 3.0",
};
