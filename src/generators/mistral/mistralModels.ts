export const enum MistralTextGenModel {
	MISTRAL_NEMO = "open-mistral-nemo",
	MISTRAL_7B = "open-mistral-7b",
	MIXTRAL_8x7B = "open-mixtral-8x7b",
	MIXTRAL_8x22B = "open-mixtral-8x22b",
	MISTRAL_LARGE = "mistral-large-latest",
}

export const mistralTextGenModels: Record<MistralTextGenModel, string> = {
	[MistralTextGenModel.MISTRAL_NEMO]: "Mistral Nemo",
	[MistralTextGenModel.MISTRAL_7B]: "Mistral 7B",
	[MistralTextGenModel.MIXTRAL_8x7B]: "Mixtral 8x7B",
	[MistralTextGenModel.MIXTRAL_8x22B]: "Mixtral 8x22B",
	[MistralTextGenModel.MISTRAL_LARGE]: "Mistral Large",
};

export const enum MistralEmbeddingModel {
	MISTRAL_EMBED = "mistral-embed",
}

export const mistralEmbeddingModels: Record<MistralEmbeddingModel, string> = {
	[MistralEmbeddingModel.MISTRAL_EMBED]: "Mistral Embed",
};
