import { GoogleTextGenModel } from "../../generators/google/googleModels";

export interface GoogleConfig {
	googleApiKey: string;
	googleBaseURL: string;
	googleTextGenModel: string;
}

export const DEFAULT_GOOGLE_SETTINGS: GoogleConfig = {
	googleApiKey: "",
	googleBaseURL: "https://generativelanguage.googleapis.com",
	googleTextGenModel: GoogleTextGenModel.GEMINI_1_5_FLASH,
};
