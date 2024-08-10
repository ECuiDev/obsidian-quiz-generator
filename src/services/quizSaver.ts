import { App, normalizePath, Notice, TFile } from "obsidian";
import { Question, QuizSettings } from "../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../utils/typeGuards";
import { shuffleArray } from "../utils/helpers";

export default class QuizSaver {
	private readonly app: App;
	private readonly settings: QuizSettings;
	private readonly questions: Question[];
	private readonly fileName: string;
	private readonly validSavePath: boolean;
	private readonly fileCreated: boolean;

	constructor(app: App, settings: QuizSettings, questions: Question[],
				fileName: string, validSavePath: boolean, fileCreated: boolean) {
		this.app = app;
		this.settings = settings;
		this.questions = questions;
		this.fileName = fileName;
		this.validSavePath = validSavePath;
		this.fileCreated = fileCreated;
	}

	public async saveQuestion(questionIndex: number): Promise<void> {
		const saveFile = await this.createSaveFile();

		if (this.settings.questionSaveFormat === "Spaced Repetition") {
			await this.app.vault.append(saveFile, this.createSpacedRepetitionQuestion(this.questions[questionIndex]));
		} else {
			await this.app.vault.append(saveFile, this.createCalloutQuestion(this.questions[questionIndex]));
		}

		if (this.validSavePath) {
			new Notice("Question saved");
		} else {
			new Notice("Invalid save path: Question saved in vault root folder");
		}
	}

	public async saveAllQuestions(): Promise<void> {
		const saveFile = await this.createSaveFile();

		for (const question of this.questions) {
			if (this.settings.questionSaveFormat === "Spaced Repetition") {
				await this.app.vault.append(saveFile, this.createSpacedRepetitionQuestion(question));
			} else {
				await this.app.vault.append(saveFile, this.createCalloutQuestion(question));
			}
		}

		if (this.validSavePath && this.questions.length > 0) {
			new Notice("All questions saved");
		} else {
			new Notice("Invalid save path: All questions saved in vault root folder");
		}
	}

	private async createSaveFile(): Promise<TFile> {
		let path = this.fileName;
		if (this.validSavePath) {
			path = normalizePath(this.settings.questionSavePath.trim() + "/" + this.fileName);
		}

		const initialContent = this.settings.questionSaveFormat === "Spaced Repetition" ? "---\ntags:\n  - flashcards\n---\n" : "";
		if (!this.fileCreated) {
			return await this.app.vault.create(path, initialContent);
		}
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			return file;
		}
		return await this.app.vault.create(path, initialContent);
	}

	private createCalloutQuestion(question: Question): string {
		if (isTrueFalse(question)) {
			const answer = question.answer.toString().charAt(0).toUpperCase() + question.answer.toString().slice(1);
			return `> [!question] ${question.question}\n` +
				`>> [!success]- Answer\n` +
				`>> ${answer}\n\n`;
		} else if (isMultipleChoice(question)) {
			const options = this.getCalloutOptions(question.options);
			return `> [!question] ${question.question}\n` +
				`${options.join("\n")}\n` +
				`>> [!success]- Answer\n` +
				`${options[question.answer].replace(">", ">>")}\n\n`;
		} else if (isSelectAllThatApply(question)) {
			const options = this.getCalloutOptions(question.options);
			const answers = options.filter((_, index) => question.answer.includes(index));
			return `> [!question] ${question.question}\n` +
				`${options.join("\n")}\n` +
				`>> [!success]- Answer\n` +
				`${answers.map(answer => answer.replace(">", ">>")).join("\n")}\n\n`;
		} else if (isFillInTheBlank(question)) {
			return `> [!question] ${question.question}\n` +
				`>> [!success]- Answer\n` +
				`>> ${question.answer.join(", ")}\n\n`;
		} else if (isMatching(question)) {
			const leftOptions = shuffleArray(question.answer.map(pair => pair.leftOption));
			const rightOptions = shuffleArray(question.answer.map(pair => pair.rightOption));
			const answers = this.getCalloutMatchingAnswers(leftOptions, rightOptions, question.answer);
			return `> [!question] ${question.question}\n` +
				`>> [!example] Group A\n` +
				`${this.getCalloutOptions(leftOptions).map(option => option.replace(">", ">>")).join("\n")}\n` +
				`>\n` +
				`>> [!example] Group B\n` +
				`${this.getCalloutOptions(rightOptions, 13).map(option => option.replace(">", ">>")).join("\n")}\n` +
				`>\n` +
				`>> [!success]- Answer\n` +
				`${answers.join("\n")}\n\n`;
		} else if (isShortOrLongAnswer(question)) {
			return `> [!question] ${question.question}\n` +
				`>> [!success]- Answer\n` +
				`>> ${question.answer}\n\n`;
		} else {
			return "> [!failure] Error saving question\n\n";
		}
	}

	private createSpacedRepetitionQuestion(question: Question): string {
		if (isTrueFalse(question)) {
			const answer = question.answer.toString().charAt(0).toUpperCase() + question.answer.toString().slice(1);
			return `**True or False:** ${question.question} ${this.settings.inlineSeparator} ${answer}\n\n`;
		} else if (isMultipleChoice(question)) {
			const options = this.getSpacedRepetitionOptions(question.options);
			return `**Multiple Choice:** ${question.question}\n` +
				`${options.join("\n")}\n` +
				`${this.settings.multilineSeparator}\n` +
				`${options[question.answer]}\n\n`;
		} else if (isSelectAllThatApply(question)) {
			const options = this.getSpacedRepetitionOptions(question.options);
			const answers = options.filter((_, index) => question.answer.includes(index));
			return `**Select All That Apply:** ${question.question}\n` +
				`${options.join("\n")}\n` +
				`${this.settings.multilineSeparator}\n` +
				`${answers.join("\n")}\n\n`;
		} else if (isFillInTheBlank(question)) {
			return `**Fill in the Blank:** ${question.question} ${this.settings.inlineSeparator} ${question.answer.join(", ")}\n\n`;
		} else if (isMatching(question)) {
			const leftOptions = shuffleArray(question.answer.map(pair => pair.leftOption));
			const rightOptions = shuffleArray(question.answer.map(pair => pair.rightOption));
			const answers = this.getSpacedRepetitionMatchingAnswers(leftOptions, rightOptions, question.answer);
			return `**Matching:** ${question.question}\n` +
				`Group A\n` +
				`${this.getSpacedRepetitionOptions(leftOptions).join("\n")}\n` +
				`Group B\n` +
				`${this.getSpacedRepetitionOptions(rightOptions, 13).join("\n")}\n` +
				`${this.settings.multilineSeparator}\n` +
				`${answers.join("\n")}\n\n`;
		} else if (isShortOrLongAnswer(question)) {
			if (question.answer.length < 300) {
				return `**Short Answer:** ${question.question} ${this.settings.inlineSeparator} ${question.answer}\n\n`;
			}
			return `**Long Answer:** ${question.question} ${this.settings.inlineSeparator} ${question.answer}\n\n`;
		} else {
			return "Error saving question\n\n";
		}
	}

	private getCalloutOptions(options: string[], startIndex: number = 0): string[] {
		const letters = "abcdefghijklmnopqrstuvwxyz".slice(startIndex);
		return options.map((option, index) => `> ${letters[index]}) ${option}`);
	}

	private getSpacedRepetitionOptions(options: string[], startIndex: number = 0): string[] {
		const letters = "abcdefghijklmnopqrstuvwxyz".slice(startIndex);
		return options.map((option, index) => `${letters[index]}) ${option}`);
	}

	private getCalloutMatchingAnswers(leftOptions: string[], rightOptions: string[], answer: { leftOption: string, rightOption: string }[]): string[] {
		const leftOptionIndexMap = new Map<string, number>(leftOptions.map((option, index) => [option, index]));
		const sortedAnswer = [...answer].sort((a, b) => leftOptionIndexMap.get(a.leftOption)! - leftOptionIndexMap.get(b.leftOption)!);

		return sortedAnswer.map(pair => {
			const leftLetter = String.fromCharCode(97 + leftOptions.indexOf(pair.leftOption));
			const rightLetter = String.fromCharCode(110 + rightOptions.indexOf(pair.rightOption));
			return `>> ${leftLetter}) -> ${rightLetter})`;
		});
	}

	private getSpacedRepetitionMatchingAnswers(leftOptions: string[], rightOptions: string[], answer: { leftOption: string, rightOption: string }[]): string[] {
		const leftOptionIndexMap = new Map<string, number>(leftOptions.map((option, index) => [option, index]));
		const sortedAnswer = [...answer].sort((a, b) => leftOptionIndexMap.get(a.leftOption)! - leftOptionIndexMap.get(b.leftOption)!);

		return sortedAnswer.map(pair => {
			const leftLetter = String.fromCharCode(97 + leftOptions.indexOf(pair.leftOption));
			const rightLetter = String.fromCharCode(110 + rightOptions.indexOf(pair.rightOption));
			return `${leftLetter}) -> ${rightLetter})`;
		});
	}
}
