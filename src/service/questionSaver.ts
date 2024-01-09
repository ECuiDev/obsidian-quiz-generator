import { App, Notice, normalizePath } from "obsidian";
import { ParsedMCQ, ParsedTF, ParsedSA } from "../utils/types";
import QuizGenerator from "../main";

export default class QuestionSaver {
	private app: App;
	private readonly plugin: QuizGenerator;
	private questions: (ParsedMCQ | ParsedTF | ParsedSA)[];
	private readonly fileName: string;
	private tags: string;

	constructor(app: App, plugin: QuizGenerator, questions: (ParsedMCQ | ParsedTF | ParsedSA)[], fileName: string, tags: string) {
		this.app = app;
		this.plugin = plugin;
		this.questions = questions;
		this.fileName = fileName;
		this.tags = tags;
	}

	async saveQuestions() {
		try {
			await this.app.vault.create(this.plugin.settings.questionSavePath.trim() + `/${this.fileName}`, "");
		} catch (error) {
			new Notice("Non-existent path. Questions saved in vault root folder.");
		}
	}

	private saveForSpacedRepetition() {

	}

	private saveAsCallout() {

	}

	private extractTags() {

	}

}
