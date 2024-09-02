import { CohereTextGenModel } from "../../../generators/cohere/cohereModels";

export interface CohereConfig {
	cohereApiKey: string;
	cohereBaseURL: string;
	cohereTextGenModel: string;
}

export const DEFAULT_COHERE_SETTINGS: CohereConfig = {
	cohereApiKey: "",
	cohereBaseURL: "https://api.cohere.com",
	cohereTextGenModel: CohereTextGenModel.COMMAND_R,
};
