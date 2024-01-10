import {App, Notice, TFile, normalizePath, requestUrl} from "obsidian";
import { ParsedMCQ, ParsedTF, ParsedSA } from "../utils/types";
import QuizGenerator from "../main";

export default class QuestionSaver {
	private app: App;
	private readonly plugin: QuizGenerator;
	private questions: (ParsedMCQ | ParsedTF | ParsedSA)[];
	private readonly fileName: string;
	private tags: string;
	private path: string;
	private spacedRepetitionFile: TFile;
	private calloutFile: TFile;

	constructor(app: App, plugin: QuizGenerator, questions: (ParsedMCQ | ParsedTF | ParsedSA)[], fileName: string, tags: string) {
		this.app = app;
		this.plugin = plugin;
		this.questions = questions;
		this.fileName = fileName;
		this.tags = tags;
	}

	async saveQuestions() {
		this.path = normalizePath(this.plugin.settings.questionSavePath.trim() + `/${this.fileName}`);

		if (this.plugin.settings.saveForSpacedRepetition) {
			await this.saveForSpacedRepetition();
		}
		if (this.plugin.settings.saveAsCallout) {
			await this.saveAsCallout();
		}
	}

	private async saveForSpacedRepetition() {
		try {
			this.spacedRepetitionFile = await this.app.vault.create(this.path, "");
		} catch (error) {
			this.spacedRepetitionFile = await this.app.vault.create("", "");
			new Notice("Non-existent path. Questions saved in vault root folder.");
		}

		this.questions.forEach(question => {
			this.app.vault.append(this.spacedRepetitionFile, "\n" + this.formatSpacedRepQuestion(question));
		});
	}

	private async saveAsCallout() {
		try {
			this.calloutFile = await this.app.vault.create(this.path, "");
		} catch (error) {
			this.calloutFile = await this.app.vault.create("", "");
			new Notice("Non-existent path. Questions saved in vault root folder.");
		}

		this.questions.forEach(question => {
			this.app.vault.append(this.calloutFile, "\n" + this.formatCalloutQuestion(question));
		});
	}

	private formatSpacedRepQuestion(question: ParsedMCQ | ParsedTF | ParsedSA) {
		if ("QuestionMC" in question) {
			return "**Multiple Choice:** " + question.QuestionMC +
				`\na) ${question["1"]}` + `\nb) ${question["2"]}` +
				`\nc) ${question["3"]}` + `\nd) ${question["4"]}` +
				`\n${this.plugin.settings.multilineSeparator}\n` +
				this.numberToAnswer(question.Answer, question);
		} else if ("QuestionTF" in question) {
			return "**True/False:** " + question.QuestionTF +
				`${this.plugin.settings.inlineSeparator}` + question.Answer;
		} else if ("QuestionSA" in question) {
			return "**Short Answer:** " + question.QuestionSA +
				`${this.plugin.settings.inlineSeparator}` + question.Answer;
		} else {
			return "Error saving question.";
		}
	}

	private formatCalloutQuestion(question: ParsedMCQ | ParsedTF | ParsedSA) {
		if ("QuestionMC" in question) {
			return `> [!question] ${question.QuestionMC}` +
				`\n> a) ${question["1"]}` + `\n> b) ${question["2"]}` +
				`\n> c) ${question["3"]}` + `\n> d) ${question["4"]}` +
				`\n>> [!success]- Answer\n>> ` + this.numberToAnswer(question.Answer, question);
		} else if ("QuestionTF" in question) {
			return `> [!question] ${question.QuestionTF}` + `\n> True or false?` +
				`\n>> [!success]- Answer\n>> ${question.Answer}`;
		} else if ("QuestionSA" in question) {
			return `> [!question] ${question.QuestionSA}` + `\n>> [!success]- Answer\n>> ${question.Answer}`;
		} else {
			return "> [!failure] Error saving question.";
		}
	}

	private extractTags() {

	}

	private numberToAnswer(input: number, question: ParsedMCQ) {
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
