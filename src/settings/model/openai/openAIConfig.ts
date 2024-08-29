import { OpenAITextGenModel } from "../../../generators/openai/openAIModels";

export interface OpenAIConfig {
	openAIApiKey: string;
	openAIBaseURL: string;
	openAITextGenModel: string;
}

export const DEFAULT_OPENAI_SETTINGS: OpenAIConfig = {
	openAIApiKey: "",
	openAIBaseURL: "https://api.openai.com/v1",
	openAITextGenModel: OpenAITextGenModel.GPT_3_5_TURBO,
};
