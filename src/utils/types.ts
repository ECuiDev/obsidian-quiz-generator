export interface ParsedMCQ {
	QuestionMC: string;
	1: string;
	2: string;
	3: string;
	4: string;
	Answer: number;
}

export interface ParsedTF {
	QuestionTF: string;
	Answer: boolean;
}

export interface ParsedSA {
	QuestionSA: string;
	Answer: string;
}

export interface QuizSettings {
	numberOfMultipleChoice: number;
	numberOfTrueFalse: number;
	numberOfShortAnswer: number;
	generateMultipleChoice: boolean;
	generateTrueFalse: boolean;
	generateShortAnswer: boolean;
	apiKey: string;
}

export const DEFAULT_SETTINGS: Partial<QuizSettings> = {
	numberOfMultipleChoice: 1,
	numberOfTrueFalse: 1,
	numberOfShortAnswer: 1,
	generateMultipleChoice: true,
	generateTrueFalse: true,
	generateShortAnswer: true,
	apiKey: ""
};
