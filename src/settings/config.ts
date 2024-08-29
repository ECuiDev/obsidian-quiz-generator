import { QuizSettings } from "../utils/types";
import { DEFAULT_GENERAL_SETTINGS } from "./general/generalConfig";
import { DEFAULT_MODEL_SETTINGS } from "./model/modelConfig";
import { DEFAULT_GENERATION_SETTINGS } from "./generation/generationConfig";
import { DEFAULT_SAVING_SETTINGS } from "./saving/savingConfig";

export const DEFAULT_SETTINGS: QuizSettings = {
	...DEFAULT_GENERAL_SETTINGS,
	...DEFAULT_MODEL_SETTINGS,
	...DEFAULT_GENERATION_SETTINGS,
	...DEFAULT_SAVING_SETTINGS,
};
