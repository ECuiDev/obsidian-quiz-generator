import { App, Notice, TFile } from "obsidian";
import { QuizSettings } from "../settings/config";
import {
	FillInTheBlank,
	Matching,
	MultipleChoice,
	Question,
	SelectAllThatApply,
	ShortOrLongAnswer,
	TrueFalse
} from "../utils/types";
import QuizModalLogic from "../ui/quiz/quizModalLogic";

export default class QuizReviewer {
	private readonly app: App;
	private readonly settings: QuizSettings;
	private readonly quiz: Question[] = [];

	constructor(app: App, settings: QuizSettings) {
		this.app = app;
		this.settings = settings;
	}

	public async openQuiz(file: TFile | null): Promise<void> {
		if (!(file instanceof TFile)) {
			new Notice("No active file");
			return;
		}

		const fileContents = await this.app.vault.cachedRead(file);
		this.calloutParser(fileContents);
		this.spacedRepetitionParser(fileContents);

		if (this.quiz.length > 0) {
			await new QuizModalLogic(this.app, this.settings, this.quiz, []).renderQuiz();
		} else {
			new Notice("No questions in this note");
		}
	}

	private calloutParser(fileContents: string): void {
		const questionCallout = />\s*\[!question][+-]?\s*(.+)\s*/;
		const answerCallout = />\s*>\s*\[!success].*\s*/;

		const choices = this.generateCalloutChoicesRegex();
		const choicesAnswer = this.generateCalloutChoicesAnswerRegex();
		const multipleChoiceSelectAllThatApplyRegex = new RegExp(
			questionCallout.source +
			choices.source +
			answerCallout.source +
			choicesAnswer.source,
			"gi"
		);
		this.matchMultipleChoiceSelectAllThatApply(fileContents, multipleChoiceSelectAllThatApplyRegex);

		const groupCallout = />\s*>\s*\[!example].*\s*/;
		const groupAChoices = choices.source.substring(0, choices.source.length / 2).replace(/>/g, ">\\s*>");
		const groupBChoices = choices.source.substring(choices.source.length / 2).replace(/>/g, ">\\s*>");
		const nestedCalloutSeparator = />\s*/;
		const matchingAnswer = this.generateCalloutMatchingAnswerRegex();
		const matchingRegex = new RegExp(
			questionCallout.source +
			groupCallout.source +
			groupAChoices +
			nestedCalloutSeparator.source +
			groupCallout.source +
			groupBChoices +
			nestedCalloutSeparator.source +
			answerCallout.source +
			matchingAnswer.source,
			"gi"
		);
		this.matchMatching(fileContents, matchingRegex);

		const trueFalseFillInTheBlankShortOrLongAnswer = />\s*>\s*(.+)/;
		const trueFalseFillInTheBlankShortOrLongAnswerRegex = new RegExp(
			questionCallout.source +
			answerCallout.source +
			trueFalseFillInTheBlankShortOrLongAnswer.source,
			"gi"
		);
		this.matchTrueFalseFillInTheBlankShortOrLongAnswer(fileContents, trueFalseFillInTheBlankShortOrLongAnswerRegex);
	}

	private spacedRepetitionParser(fileContents: string): void {
		const inlineSeparator = this.escapeSpecialCharacters(this.settings.inlineSeparator);
		const multilineSeparator = this.escapeSpecialCharacters(this.settings.multilineSeparator);

		const choices = this.generateSpacedRepetitionChoicesRegex();
		const choicesAnswer = this.generateSpacedRepetitionChoicesAnswerRegex();
		const multipleChoiceSelectAllThatApply = /[*_]{0,3}(?:multiple\s*choice|select\s*all\s*that\s*apply):[*_]{0,3}\s*(.+)\s*/;
		const multipleChoiceRegex = new RegExp(
			multipleChoiceSelectAllThatApply.source +
			choices.source +
			multilineSeparator.source +
			"\\s*" +
			choicesAnswer.source,
			"gi"
		);
		this.matchMultipleChoiceSelectAllThatApply(fileContents, multipleChoiceRegex);

		const matching = /[*_]{0,3}matching:[*_]{0,3}\s*(.+)\s*/;
		const groupHeader = /.+\s*/;
		const groupAChoices = choices.source.substring(0, choices.source.length / 2);
		const groupBChoices = choices.source.substring(choices.source.length / 2);
		const matchingAnswer = this.generateSpacedRepetitionMatchingAnswerRegex();
		const matchingRegex = new RegExp(
			matching.source +
			groupHeader.source +
			groupAChoices +
			groupHeader.source +
			groupBChoices +
			multilineSeparator.source +
			"\\s*" +
			matchingAnswer.source,
			"gi"
		);
		this.matchMatching(fileContents, matchingRegex);

		const trueFalseFillInTheBlankShortOrLong = /[*_]{0,3}(?:true\s*or\s*false|fill\s*in\s*the\s*blank|(?:short|long)\s*answer):[*_]{0,3}\s*(.+)\s*/;
		const trueFalseFillInTheBlankShortOrLongAnswer = /\s*(.+)/;
		const trueFalseFillInTheBlankShortOrLongRegex = new RegExp(
			trueFalseFillInTheBlankShortOrLong.source +
			inlineSeparator.source +
			trueFalseFillInTheBlankShortOrLongAnswer.source,
			"gi"
		);
		this.matchTrueFalseFillInTheBlankShortOrLongAnswer(fileContents, trueFalseFillInTheBlankShortOrLongRegex);
	}

	private generateCalloutChoicesRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:>\\s*${letter}\\)\\s*(.+)\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private generateCalloutChoicesAnswerRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:>\\s*>\\s*(${letter})\\).*\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private generateCalloutMatchingAnswerRegex(): RegExp {
		const pairs: string[] = [];
		for (let i = 0; i < 13; i++) {
			pairs.push(`(?:>\\s*>\\s*([a-m]\\)\\s*-+>\\s*[n-z]\\))\\s*)?`);
		}
		return new RegExp(pairs.join(""));
	}

	private generateSpacedRepetitionChoicesRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:${letter}\\)\\s*(.+)\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private generateSpacedRepetitionChoicesAnswerRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:(${letter})\\).*\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private generateSpacedRepetitionMatchingAnswerRegex(): RegExp {
		const pairs: string[] = [];
		for (let i = 0; i < 13; i++) {
			pairs.push(`(?:([a-m]\\)\\s*-+>\\s*[n-z]\\))\\s*)?`);
		}
		return new RegExp(pairs.join(""));
	}

	private matchMultipleChoiceSelectAllThatApply(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			const options = match.slice(2, 28).filter(option => typeof option !== "undefined");
			const answer = match.slice(28).filter(letter => typeof letter !== "undefined");
			if (options.length === 0 || answer.length === 0 || answer.length > options.length) continue;
			if (answer.length === 1) {
				this.quiz.push({
					question: match[1],
					options: options,
					answer: answer[0].toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
				} as MultipleChoice)
			} else {
				this.quiz.push({
					question: match[1],
					options: options,
					answer: answer.map(letter => letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0))
				} as SelectAllThatApply)
			}
		}
	}

	private matchMatching(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			const leftOptions = match.slice(2, 15).filter(option => typeof option !== "undefined");
			const rightOptions = match.slice(15, 28).filter(option => typeof option !== "undefined");
			const answer: { leftOption: string, rightOption: string }[] = [];
			match.slice(28).filter(option => typeof option !== "undefined").forEach(pair => {
				const [left, right] = pair.split(/\s*-+>\s*/);
				const leftIndex = left.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
				const rightIndex = right.toLowerCase().charCodeAt(0) - "n".charCodeAt(0);
				answer.push({ leftOption: leftOptions[leftIndex], rightOption: rightOptions[rightIndex] });
			});

			const leftLength = leftOptions.length;
			const rightLength = rightOptions.length;
			if (leftLength === 0 || rightLength === 0 || answer.length === 0) continue;
			if (leftLength !== rightLength || leftLength !== answer.length || rightLength !== answer.length) continue;

			this.quiz.push({
				question: match[1],
				answer: answer
			} as Matching);
		}
	}

	private matchTrueFalseFillInTheBlankShortOrLongAnswer(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			if (match[2].toLowerCase() === "true" || match[2].toLowerCase() === "false") {
				this.quiz.push({
					question: match[1],
					answer: match[2].toLowerCase() === "true"
				} as TrueFalse);
			} else if (/`_+`/.test(match[1])) {
				this.quiz.push({
					question: match[1],
					answer: match[2].split(/\s*,\s+/)
				} as FillInTheBlank);
			} else {
				this.quiz.push({
					question: match[1],
					answer: match[2]
				} as ShortOrLongAnswer);
			}
		}
	}

	private escapeSpecialCharacters(pattern: string): RegExp {
		const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp(escapedPattern);
	}
}
