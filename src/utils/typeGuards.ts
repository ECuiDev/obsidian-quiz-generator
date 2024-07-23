import {
	FillInTheBlank,
	Matching,
	MultipleChoice,
	Question,
	SelectAllThatApply,
	ShortOrLongAnswer,
	TrueFalse
} from "./types";

export const isTrueFalse = (question: Question): question is TrueFalse => {
	return typeof question.answer === "boolean";
};

export const isMultipleChoice = (question: Question): question is MultipleChoice => {
	return typeof question.answer === "number";
};

export const isSelectAllThatApply = (question: Question): question is SelectAllThatApply => {
	return Array.isArray(question.answer) && question.answer.every(item => typeof item === "number");
};

export const isFillInTheBlank = (question: Question): question is FillInTheBlank => {
	return Array.isArray(question.answer) && question.answer.every(item => typeof item === "string");
};

export const isMatching = (question: Question): question is Matching => {
	return Array.isArray(question.answer) &&
		question.answer.every(item => typeof item === "object" && "leftOption" in item && "rightOption" in item);
};

export const isShortOrLongAnswer = (question: Question): question is ShortOrLongAnswer => {
	return typeof question.answer === "string";
};
