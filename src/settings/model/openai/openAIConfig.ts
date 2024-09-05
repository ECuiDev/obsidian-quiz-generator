import { OpenAIEmbeddingModel, OpenAITextGenModel } from "../../../generators/openai/openAIModels";

export interface OpenAIConfig {
	openAIApiKey: string;
	openAIBaseURL: string;
	openAITextGenModel: string;
	openAIEmbeddingModel: string;
}

export const DEFAULT_OPENAI_SETTINGS: OpenAIConfig = {
	openAIApiKey: "",
	openAIBaseURL: "https://api.openai.com/v1",
	openAITextGenModel: OpenAITextGenModel.GPT_3_5_TURBO,
	openAIEmbeddingModel: OpenAIEmbeddingModel.TEXT_EMBEDDING_3_SMALL,
};
