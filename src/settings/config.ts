import { DEFAULT_GENERAL_SETTINGS, GeneralConfig } from "./general/generalConfig";
import { DEFAULT_MODEL_SETTINGS, ModelConfig } from "./model/modelConfig";
import { DEFAULT_GENERATION_SETTINGS, GenerationConfig } from "./generation/generationConfig";
import { DEFAULT_SAVING_SETTINGS, SavingConfig } from "./saving/savingConfig";

export type QuizSettings = GeneralConfig & ModelConfig & GenerationConfig & SavingConfig;

export const DEFAULT_SETTINGS: QuizSettings = {
	...DEFAULT_GENERAL_SETTINGS,
	...DEFAULT_MODEL_SETTINGS,
	...DEFAULT_GENERATION_SETTINGS,
	...DEFAULT_SAVING_SETTINGS,
};
