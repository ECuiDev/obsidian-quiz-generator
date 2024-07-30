import { App, normalizePath, Notice, TFile } from "obsidian";
import { Question, QuizSettings } from "../utils/types";
import { isMultipleChoice, isShortOrLongAnswer, isTrueFalse } from "../utils/typeGuards";

export default class QuestionSaver {
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
			await this.app.vault.append(saveFile, "\n\n" + this.createSpacedRepetitionQuestion(this.questions[questionIndex]));
		} else {
			await this.app.vault.append(saveFile, "\n\n" + this.createCalloutQuestion(this.questions[questionIndex]));
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
				await this.app.vault.append(saveFile, "\n\n" + this.createSpacedRepetitionQuestion(question));
			} else {
				await this.app.vault.append(saveFile, "\n\n" + this.createCalloutQuestion(question));
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

		if (!this.fileCreated) {
			return await this.app.vault.create(path, "#flashcards");
		}
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			return file;
		}
		return await this.app.vault.create(path, "#flashcards");
	}

	private createCalloutQuestion(question: Question): string {
		if (isMultipleChoice(question)) {
			const options = this.getCalloutOptions(question.options);
			return `> [!question] ${question.question}${options.join("")}\n>> [!success]- Answer\n>>` +
				options[question.answer].replace("\n>", "");
		} else if (isTrueFalse(question)) {
			return `> [!question] ${question.question}\n> True or false?\n>> [!success]- Answer\n>> ` +
				question.answer.toString().charAt(0).toUpperCase() + question.answer.toString().slice(1);
		} else if (isShortOrLongAnswer(question)) {
			return `> [!question] ${question.question}\n>> [!success]- Answer\n>> ${question.answer}`;
		} else {
			return "> [!failure] Error saving question.";
		}
	}

	private createSpacedRepetitionQuestion(question: Question): string {
		if (isMultipleChoice(question)) {
			const options = this.getSpacedRepetitionOptions(question.options);
			return `**Multiple Choice:** ${question.question}${options.join("")}\n${this.settings.multilineSeparator}\n` +
				options[question.answer].replace("\n", "");
		} else if (isTrueFalse(question)) {
			return `**True or False:** ${question.question} ${this.settings.inlineSeparator} ` +
				question.answer.toString().charAt(0).toUpperCase() + question.answer.toString().slice(1);
		} else if (isShortOrLongAnswer(question)) {
			if (question.answer.length < 300) {
				return `**Short Answer:** ${question.question} ${this.settings.inlineSeparator} ${question.answer}`;
			}
			return `**Long Answer:** ${question.question} ${this.settings.inlineSeparator} ${question.answer}`;
		} else {
			return "Error saving question.";
		}
	}

	private getCalloutOptions(options: string[]): string[] {
		const letters = "abcdefghijklmnopqrstuvwxyz";
		return options.map((option, index) => `\n> ${letters[index]}) ${option}`);
	}

	private getSpacedRepetitionOptions(options: string[]): string[] {
		const letters = "abcdefghijklmnopqrstuvwxyz";
		return options.map((option, index) => `\n${letters[index]}) ${option}`);
	}
}
