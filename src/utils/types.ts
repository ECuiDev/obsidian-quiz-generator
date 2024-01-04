export interface ParsedMCQ {
	question: string;
	choice1: string;
	choice2: string;
	choice3: string;
	choice4: string;
	answer: number;
}

export interface ParsedTF {
	question: string;
	answer: string;
}

export interface ParsedSA {
	question: string;
	answer: string;
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
