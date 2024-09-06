import { CohereEmbeddingModel, CohereTextGenModel } from "../../../generators/cohere/cohereModels";

export interface CohereConfig {
	cohereApiKey: string;
	cohereBaseURL: string;
	cohereTextGenModel: string;
	cohereEmbeddingModel: string;
}

export const DEFAULT_COHERE_SETTINGS: CohereConfig = {
	cohereApiKey: "",
	cohereBaseURL: "https://api.cohere.com",
	cohereTextGenModel: CohereTextGenModel.COMMAND_R,
	cohereEmbeddingModel: CohereEmbeddingModel.EMBED_ENGLISH_LIGHT_3_0,
};
