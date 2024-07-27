export interface Quiz {
	[questions: string]: Question[];
}

export type Question = TrueFalse | MultipleChoice | SelectAllThatApply | FillInTheBlank | Matching | ShortOrLongAnswer;

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
	question: string; // TypeScript supports __1__, __2__, __3__, and __4__ types. (Use __number__ where number is the index of the correct choice in the answer array)
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

export type SelectorModalButtons = "clear" | "quiz" | "note" | "folder" | "generate";

export const models: Record<string, string> = {
	"gpt-3.5-turbo": "GPT-3.5 Turbo",
	"gpt-4-turbo": "GPT-4 Turbo",
	"gpt-4o-mini": "GPT-4o Mini",
	"gpt-4o": "GPT-4o",
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

export const saveFormats: Record<string, string> = {
	"Callout": "Callout",
	"Spaced Repetition": "Spaced Repetition",
};

export interface QuizSettings {
	apiKey: string;
	apiBaseURL: string;
	model: string;
	showNotePath: boolean;
	showFolderPath: boolean;
	includeSubfolderNotes: boolean;
	randomizeQuestions: boolean;
	language: string;
	numberOfMultipleChoice: number;
	numberOfTrueFalse: number;
	numberOfShortAnswer: number;
	generateMultipleChoice: boolean;
	generateTrueFalse: boolean;
	generateShortAnswer: boolean;
	autoSave: boolean;
	questionSavePath: string;
	questionSaveFormat: string;
	inlineSeparator: string;
	multilineSeparator: string;
}

export const DEFAULT_SETTINGS: QuizSettings = {
	apiKey: "",
	apiBaseURL: "https://api.openai.com/v1",
	model: "gpt-3.5-turbo",
	showNotePath: false,
	showFolderPath: false,
	includeSubfolderNotes: true,
	randomizeQuestions: true,
	language: "English",
	numberOfMultipleChoice: 1,
	numberOfTrueFalse: 1,
	numberOfShortAnswer: 1,
	generateMultipleChoice: true,
	generateTrueFalse: true,
	generateShortAnswer: true,
	autoSave: false,
	questionSavePath: "",
	questionSaveFormat: "Callout",
	inlineSeparator: "::",
	multilineSeparator: "?",
};
