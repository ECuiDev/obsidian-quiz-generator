import { App, normalizePath, TFile } from "obsidian";
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
	}

	private async createSaveFile(): Promise<TFile> {
		let path = this.fileName;
		if (this.validSavePath) {
			path = normalizePath(this.settings.questionSavePath.trim() + "/" + this.fileName);
		}

		if (!this.fileCreated) {
			return await this.app.vault.create(path, "#flashcards");
		} else {
			const file = this.app.vault.getAbstractFileByPath(path);

			if (file instanceof TFile) {
				return file;
			} else {
				return await this.app.vault.create(path, "#flashcards");
			}
		}
	}

	private createSpacedRepetitionQuestion(question: Question): string {
		if (isMultipleChoice(question)) {
			const options = this.formatOptions(question.options, "Spaced Repetition");
			return "**Multiple Choice:** " + question.question + options.join("") +
				`\n${this.settings.multilineSeparator}\n` + options[question.answer].replace("\n", "");
		} else if (isTrueFalse(question)) {
			return "**True/False:** " + question.question + ` ${this.settings.inlineSeparator} ` +
				question.answer.toString().charAt(0).toUpperCase() + question.answer.toString().slice(1);
		} else if (isShortOrLongAnswer(question)) {
			return "**Short Answer:** " + question.question + ` ${this.settings.inlineSeparator} ` + question.answer;
		} else {
			return "Error saving question.";
		}
	}

	private createCalloutQuestion(question: Question): string {
		if (isMultipleChoice(question)) {
			const options = this.formatOptions(question.options, "Callout");
			return `> [!question] ${question.question}` + options.join("") +
				`\n>> [!success]- Answer\n>>` + options[question.answer].replace("\n>", "");
		} else if (isTrueFalse(question)) {
			return `> [!question] ${question.question}` + `\n> True or false?` +
				`\n>> [!success]- Answer\n>> ` + question.answer.toString().charAt(0).toUpperCase() +
				question.answer.toString().slice(1);
		} else if (isShortOrLongAnswer(question)) {
			return `> [!question] ${question.question}` + `\n>> [!success]- Answer\n>> ${question.answer}`;
		} else {
			return "> [!failure] Error saving question.";
		}
	}

	private formatOptions(options: string[], format: "Spaced Repetition" | "Callout"): string[] {
		const letters = "abcdefghijklmnopqrstuvwxyz";
		if (format === "Spaced Repetition") {
			return options.map((option, index) => `\n${letters[index]}) ${option}`);
		} else {
			return options.map((option, index) => `\n> ${letters[index]}) ${option}`);
		}
	}
}
