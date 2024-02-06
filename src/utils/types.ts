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

export interface QuizSettings {
	apiKey: string;
	model: string;
	showNotePath: boolean;
	showFolderPath: boolean;
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
	model: "gpt-3.5-turbo-1106",
	showNotePath: false,
	showFolderPath: false,
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
