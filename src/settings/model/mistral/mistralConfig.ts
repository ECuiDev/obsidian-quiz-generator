import { MistralTextGenModel } from "../../../generators/mistral/mistralModels";

export interface MistralConfig {
	mistralApiKey: string;
	mistralBaseURL: string;
	mistralTextGenModel: string;
}

export const DEFAULT_MISTRAL_SETTINGS: MistralConfig = {
	mistralApiKey: "",
	mistralBaseURL: "https://api.mistral.ai",
	mistralTextGenModel: MistralTextGenModel.MISTRAL_NEMO,
};
