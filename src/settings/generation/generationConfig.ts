export interface GenerationConfig {
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
}

export const DEFAULT_GENERATION_SETTINGS: GenerationConfig = {
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
};
