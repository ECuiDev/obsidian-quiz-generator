export type Question = TrueFalse | MultipleChoice | SelectAllThatApply | FillInTheBlank | Matching | ShortOrLongAnswer;

export interface Quiz {
	questions: Question[];
}

export interface TrueFalse {
	question: string;
	answer: boolean;
}

export interface MultipleChoice {
	question: string;
	options: string[];
	answer: number;
}

export interface SelectAllThatApply {
	question: string;
	options: string[];
	answer: number[];
}

export interface FillInTheBlank {
	question: string;
	answer: string[];
}

export interface Matching {
	question: string;
	answer: {
		leftOption: string;
		rightOption: string;
	}[];
}

export interface ShortOrLongAnswer {
	question: string;
	answer: string;
}

export const enum SelectorModalButton {
	CLEAR = "CLEAR",
	QUIZ = "QUIZ",
	NOTE = "NOTE",
	FOLDER = "FOLDER",
	GENERATE = "GENERATE",
}

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

export enum Provider {
	OPENAI = "OPENAI",
	GOOGLE = "GOOGLE",
}

export const providers: Record<Provider, string> = {
	[Provider.OPENAI]: "OpenAI",
	[Provider.GOOGLE]: "Google",
};

export const enum OpenAITextGenModel {
	GPT_3_5_TURBO = "gpt-3.5-turbo",
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4o_MINI = "gpt-4o-mini",
	GPT_4o = "gpt-4o",
}

export const openAITextGenModels: Record<OpenAITextGenModel, string> = {
	[OpenAITextGenModel.GPT_3_5_TURBO]: "GPT-3.5 Turbo",
	[OpenAITextGenModel.GPT_4_TURBO]: "GPT-4 Turbo",
	[OpenAITextGenModel.GPT_4o_MINI]: "GPT-4o Mini",
	[OpenAITextGenModel.GPT_4o]: "GPT-4o"
};

export const enum GoogleTextGenModel {
	GEMINI_1_5_FLASH = "gemini-1.5-flash",
	GEMINI_1_5_PRO = "gemini-1.5-pro",
}

export const googleTextGenModels: Record<GoogleTextGenModel, string> = {
	[GoogleTextGenModel.GEMINI_1_5_FLASH]: "Gemini 1.5 Flash",
	[GoogleTextGenModel.GEMINI_1_5_PRO]: "Gemini 1.5 Pro",
};

export const enum SaveFormat {
	CALLOUT = "Callout",
	SPACED_REPETITION = "Spaced Repetition",
}

export const saveFormats: Record<SaveFormat, string> = {
	[SaveFormat.CALLOUT]: "Callout",
	[SaveFormat.SPACED_REPETITION]: "Spaced Repetition",
};

export interface QuizSettings {
	provider: string;
	showNotePath: boolean;
	showFolderPath: boolean;
	includeSubfolderNotes: boolean;
	randomizeQuestions: boolean;
	language: string;
	openAIApiKey: string;
	openAIBaseURL: string;
	openAITextGenModel: string;
	googleApiKey: string;
	googleTextGenModel: string;
	generateTrueFalse: boolean;
	numberOfTrueFalse: number;
	generateMultipleChoice: boolean;
	numberOfMultipleChoice: number;
	generateSelectAllThatApply: boolean;
	numberOfSelectAllThatApply: number;
	generateFillInTheBlank: boolean;
	numberOfFillInTheBlank: number;
	generateMatching: boolean;
	numberOfMatching: number;
	generateShortAnswer: boolean;
	numberOfShortAnswer: number;
	generateLongAnswer: boolean;
	numberOfLongAnswer: number;
	autoSave: boolean;
	savePath: string;
	saveFormat: string;
	inlineSeparator: string;
	multilineSeparator: string;
}

export const DEFAULT_SETTINGS: QuizSettings = {
	provider: Provider.OPENAI,
	showNotePath: false,
	showFolderPath: false,
	includeSubfolderNotes: true,
	randomizeQuestions: true,
	language: "English",
	openAIApiKey: "",
	openAIBaseURL: "https://api.openai.com/v1",
	openAITextGenModel: OpenAITextGenModel.GPT_3_5_TURBO,
	googleApiKey: "",
	googleTextGenModel: GoogleTextGenModel.GEMINI_1_5_FLASH,
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
