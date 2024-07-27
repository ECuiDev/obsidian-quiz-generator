import { App, Notice, TFile } from "obsidian";
import { MultipleChoice, Question, QuizSettings, ShortOrLongAnswer, TrueFalse } from "../utils/types";
import QuizModalLogic from "../ui/quizModalLogic";

export default class QuizReviewer {
	private readonly app: App;
	private readonly settings: QuizSettings;
	private readonly questions: Question[];

	constructor(app: App, settings: QuizSettings) {
		this.app = app;
		this.settings = settings;
		this.questions = [];
	}

	public async openQuiz(file: TFile | null): Promise<void> {
		if (file instanceof TFile) {
			const fileContents = await this.app.vault.cachedRead(file);
			this.calloutParser(fileContents);
			this.spacedRepetitionParser(fileContents);
			await new QuizModalLogic(this.app, this.settings, this.questions, Array(this.questions.length).fill(true)).renderQuiz();
		} else {
			new Notice("No active file.");
		}
	}

	private calloutParser(fileContents: string): void {
		const questionCallout = />\s*\[!question][+-]?\s*(.+)\s*/;
		const choices = this.generateCalloutChoicesRegex();
		const answerCallout = />>\s*\[!success].*\s*/;

		const trueFalseBody = />\s*true\s*or\s*false\??\s*/;
		const trueFalseAnswer = />>\s*(true|false)/;
		const trueFalseRegex = new RegExp(
			questionCallout.source +
			trueFalseBody.source +
			answerCallout.source +
			trueFalseAnswer.source,
			"gi"
		);
		this.matchTrueFalse(fileContents, trueFalseRegex);

		const multipleChoiceAnswer = />>\s*([a-z])\)/;
		const multipleChoiceRegex = new RegExp(
			questionCallout.source +
			choices.source +
			answerCallout.source +
			multipleChoiceAnswer.source,
			"gi"
		);
		this.matchMultipleChoice(fileContents, multipleChoiceRegex);

		const shortOrLongAnswer = />>\s*(.+)/;
		const shortOrLongAnswerRegex = new RegExp(
			questionCallout.source +
			answerCallout.source +
			shortOrLongAnswer.source,
			"gi"
		);
		this.matchShortOrLongAnswer(fileContents, shortOrLongAnswerRegex);
	}

	private spacedRepetitionParser(fileContents: string): void {
		const choices = this.generateSpacedRepetitionChoicesRegex();
		const inlineSeparator = this.escapeSpecialCharacters(this.settings.inlineSeparator);
		const multilineSeparator = this.escapeSpecialCharacters(this.settings.multilineSeparator);

		const trueFalse = /[*_]{0,3}true\/false:[*_]{0,3}\s*(.+)\s*/;
		const trueFalseAnswer = /\s*(true|false)/;
		const trueFalseRegex = new RegExp(
			trueFalse.source +
			inlineSeparator.source +
			trueFalseAnswer.source,
			"gi"
		);
		this.matchTrueFalse(fileContents, trueFalseRegex);

		const multipleChoice = /[*_]{0,3}multiple\s*choice:[*_]{0,3}\s*(.+)\s*/;
		const multipleChoiceAnswer = /\s*([a-z])\)/;
		const multipleChoiceRegex = new RegExp(
			multipleChoice.source +
			choices.source +
			multilineSeparator.source +
			multipleChoiceAnswer.source,
			"gi"
		);
		this.matchMultipleChoice(fileContents, multipleChoiceRegex);

		const shortOrLong = /[*_]{0,3}(?:short|long)\s*answer:[*_]{0,3}\s*(.+)\s*/;
		const shortOrLongAnswer = /\s*(.+)/;
		const shortOrLongAnswerRegex = new RegExp(
			shortOrLong.source +
			inlineSeparator.source +
			shortOrLongAnswer.source,
			"gi"
		);
		this.matchShortOrLongAnswer(fileContents, shortOrLongAnswerRegex);
	}

	private generateCalloutChoicesRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:>\\s*${letter}\\)\\s*(.+)\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private generateSpacedRepetitionChoicesRegex(): RegExp {
		const choices: string[] = [];
		for (let i = 0; i < 26; i++) {
			const letter = String.fromCharCode(97 + i);
			choices.push(`(?:${letter}\\)\\s*(.+)\\s*)?`);
		}
		return new RegExp(choices.join(""));
	}

	private escapeSpecialCharacters(pattern: string): RegExp {
		const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp(escapedPattern);
	}

	private matchTrueFalse(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			this.questions.push({
				question: match[1],
				answer: match[2] === "true"
			} as TrueFalse);
		}
	}

	private matchMultipleChoice(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			this.questions.push({
				question: match[1],
				options: match.slice(2, -1),
				answer: match[match.length - 1].toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
			} as MultipleChoice);
		}
	}

	private matchShortOrLongAnswer(fileContents: string, pattern: RegExp): void {
		const matches = fileContents.matchAll(pattern);
		for (const match of matches) {
			this.questions.push({
				question: match[1],
				answer: match[2]
			} as ShortOrLongAnswer);
		}
	}
}
