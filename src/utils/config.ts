import {
	AnthropicTextGenModel,
	GoogleTextGenModel,
	OpenAITextGenModel,
	PerplexityTextGenModel,
	Provider
} from "./models";
import { QuizSettings } from "./types";

export const languages: Record<string, string> = {
	English: "English",
	German: "Deutsch",
	Spanish: "Español",
	French: "Français",
	Russian: "Pусский",
	Chinese: "中文",
	Portuguese: "Português",
	Korean: "한국어",
	Japanese: "日本語",
	Arabic: "العربية",
	Danish: "Dansk",
	Norwegian: "Norsk",
	Dutch: "Nederlands",
	Italian: "Italiano",
	Polish: "Polski",
	Hindi: "हिन्दी",
	Vietnamese: "Tiếng Việt",
	Ukrainian: "українська",
	Swedish: "Svenska",
	Persian: "فارسی",
	Greek: "Ελληνικά",
};

export const enum SaveFormat {
	CALLOUT = "Callout",
	SPACED_REPETITION = "Spaced Repetition",
}

export const saveFormats: Record<SaveFormat, string> = {
	[SaveFormat.CALLOUT]: "Callout",
	[SaveFormat.SPACED_REPETITION]: "Spaced Repetition",
};

export const DEFAULT_SETTINGS: QuizSettings = {
	showNotePath: false,
	showFolderPath: false,
	includeSubfolderNotes: true,
	randomizeQuestions: true,
	language: "English",
	provider: Provider.OPENAI,
	openAIApiKey: "",
	openAIBaseURL: "https://api.openai.com/v1",
	openAITextGenModel: OpenAITextGenModel.GPT_3_5_TURBO,
	googleApiKey: "",
	googleBaseURL: "https://generativelanguage.googleapis.com",
	googleTextGenModel: GoogleTextGenModel.GEMINI_1_5_FLASH,
	anthropicApiKey: "",
	anthropicBaseURL: "https://api.anthropic.com",
	anthropicTextGenModel: AnthropicTextGenModel.CLAUDE_3_HAIKU,
	perplexityApiKey: "",
	perplexityTextGenModel: PerplexityTextGenModel.LLAMA_3_1_SONAR_SMALL_ONLINE,
	generateTrueFalse: true,
	numberOfTrueFalse: 1,
	generateMultipleChoice: true,
	numberOfMultipleChoice: 1,
	generateSelectAllThatApply: true,
	numberOfSelectAllThatApply: 1,
	generateFillInTheBlank: true,
	numberOfFillInTheBlank: 1,
	generateMatching: true,
	numberOfMatching: 1,
	generateShortAnswer: true,
	numberOfShortAnswer: 1,
	generateLongAnswer: true,
	numberOfLongAnswer: 1,
	autoSave: false,
	savePath: "",
	saveFormat: SaveFormat.CALLOUT,
	inlineSeparator: "::",
	multilineSeparator: "?",
};
