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
	anthropicApiKey: string;
	anthropicBaseURL: string;
	anthropicTextGenModel: string;
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
