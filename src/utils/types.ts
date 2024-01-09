export interface ParsedQuestions {
	[quiz: string]: (ParsedMCQ | ParsedTF | ParsedSA)[];
}

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
	apiKey: string;
	numberOfMultipleChoice: number;
	numberOfTrueFalse: number;
	numberOfShortAnswer: number;
	generateMultipleChoice: boolean;
	generateTrueFalse: boolean;
	generateShortAnswer: boolean;
	saveWithSpacedRepetition: boolean;
	inlineSeparator: string;
	multilineSeparator: string;
	saveAsCallout: boolean;
}

export const DEFAULT_SETTINGS: Partial<QuizSettings> = {
	apiKey: "",
	numberOfMultipleChoice: 1,
	numberOfTrueFalse: 1,
	numberOfShortAnswer: 1,
	generateMultipleChoice: true,
	generateTrueFalse: true,
	generateShortAnswer: true,
	saveWithSpacedRepetition: false,
	inlineSeparator: "::",
	multilineSeparator: "?",
	saveAsCallout: true
};
