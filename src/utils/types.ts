export interface ParsedQuestions {
	[quiz: string]: (ParsedMC | ParsedTF | ParsedSA)[];
}

export interface ParsedMC {
	questionMC: string;
	1: string;
	2: string;
	3: string;
	4: string;
	answer: number;
}

export interface ParsedTF {
	questionTF: string;
	answer: boolean;
}

export interface ParsedSA {
	questionSA: string;
	answer: string;
}

export const models: Record<string, string> = {
	"gpt-3.5-turbo-0125": "GPT-3.5",
	"gpt-4-0125-preview": "GPT-4"
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
	Ukrainian: "українська"
};

export interface QuizSettings {
	apiKey: string;
	model: string;
	showNotePath: boolean;
	showFolderPath: boolean;
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
	saveForSpacedRepetition: boolean;
	inlineSeparator: string;
	multilineSeparator: string;
	saveAsCallout: boolean;
}

export const DEFAULT_SETTINGS: Partial<QuizSettings> = {
	apiKey: "",
	model: "gpt-3.5-turbo-0125",
	showNotePath: false,
	showFolderPath: false,
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
	saveForSpacedRepetition: false,
	inlineSeparator: "::",
	multilineSeparator: "?",
	saveAsCallout: true
};
