import { App, normalizePath, TFile } from "obsidian";
import { ParsedMC, ParsedSA, ParsedTF } from "../utils/types";
import QuizGenerator from "../main";

export default class QuestionSaver {
	private app: App;
	private readonly plugin: QuizGenerator;
	private readonly question: ParsedMC | ParsedTF | ParsedSA;
	private readonly fileName: string;
	private readonly validPath: boolean;
	private readonly fileCreated: boolean;

	constructor(app: App, plugin: QuizGenerator, question: ParsedMC | ParsedTF | ParsedSA,
				fileName: string, validPath: boolean, fileCreated: boolean) {
		this.app = app;
		this.plugin = plugin;
		this.question = question;
		this.fileName = fileName;
		this.validPath = validPath;
		this.fileCreated = fileCreated;
	}

	public async saveQuestion(): Promise<void> {
		let path: string;
		let quizFile: TFile;
		if (this.validPath) {
			path = normalizePath(this.plugin.settings.questionSavePath.trim() + "/" + this.fileName);
		} else {
			path = this.fileName;
		}

		if (!this.fileCreated) {
			quizFile = await this.app.vault.create(path, "#flashcards");
		} else {
			const file = this.app.vault.getAbstractFileByPath(path);

			if (file instanceof TFile) {
				quizFile = file;
			} else {
				quizFile = await this.app.vault.create(path, "#flashcards");
			}
		}

		if (this.plugin.settings.questionSaveFormat === "Spaced Repetition") {
			await this.saveForSpacedRepetition(quizFile);
		} else {
			await this.saveAsCallout(quizFile);
		}
	}

	private async saveForSpacedRepetition(file: TFile): Promise<void> {
		await this.app.vault.append(file, "\n\n" + this.formatSpacedRepQuestion(this.question));
	}

	private async saveAsCallout(file: TFile): Promise<void> {
		await this.app.vault.append(file, "\n\n" + this.formatCalloutQuestion(this.question));
	}

	private formatSpacedRepQuestion(question: ParsedMC | ParsedTF | ParsedSA): string {
		if ("questionMC" in question) {
			return "**Multiple Choice:** " + question.questionMC +
				`\na) ${question["1"]}` + `\nb) ${question["2"]}` +
				`\nc) ${question["3"]}` + `\nd) ${question["4"]}` +
				`\n${this.plugin.settings.multilineSeparator}\n` +
				this.numberToAnswer(question.answer, question);
		} else if ("questionTF" in question) {
			return "**True/False:** " + question.questionTF +
				` ${this.plugin.settings.inlineSeparator} ` + question.answer.toString().charAt(0).toUpperCase() +
				question.answer.toString().slice(1);
		} else if ("questionSA" in question) {
			return "**Short Answer:** " + question.questionSA +
				` ${this.plugin.settings.inlineSeparator} ` + question.answer;
		} else {
			return "Error saving question.";
		}
	}

	private formatCalloutQuestion(question: ParsedMC | ParsedTF | ParsedSA): string {
		if ("questionMC" in question) {
			return `> [!question] ${question.questionMC}` +
				`\n> a) ${question["1"]}` + `\n> b) ${question["2"]}` +
				`\n> c) ${question["3"]}` + `\n> d) ${question["4"]}` +
				`\n>> [!success]- Answer\n>> ` + this.numberToAnswer(question.answer, question);
		} else if ("questionTF" in question) {
			return `> [!question] ${question.questionTF}` + `\n> True or false?` +
				`\n>> [!success]- Answer\n>> ` + question.answer.toString().charAt(0).toUpperCase() +
				question.answer.toString().slice(1);
		} else if ("questionSA" in question) {
			return `> [!question] ${question.questionSA}` + `\n>> [!success]- Answer\n>> ${question.answer}`;
		} else {
			return "> [!failure] Error saving question.";
		}
	}

	private numberToAnswer(input: number, question: ParsedMC): string {
		switch (input) {
			case 1:
				return "a) " + question["1"];
			case 2:
				return "b) " + question["2"];
			case 3:
				return "c) " + question["3"];
			case 4:
				return "d) " + question["4"];
			default:
				return "Error saving answer.";
		}
	}
}
