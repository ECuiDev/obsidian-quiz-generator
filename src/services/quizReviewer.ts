import { App, TFile, Notice } from "obsidian";
import QuizGenerator from "../main";
import QuizModal from "../ui/quizModal";
import { ParsedMC, ParsedTF, ParsedSA } from "../utils/types";

export default class QuizReviewer {
	private readonly app: App;
	private readonly plugin: QuizGenerator;
	private quiz: QuizModal;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];

	constructor(app: App, plugin: QuizGenerator) {
		this.app = app;
		this.plugin = plugin;
		this.questionsAndAnswers = [];
	}

	public async openQuiz(file: TFile | null): Promise<void> {
		if (file instanceof TFile) {
			const fileContents = await this.app.vault.cachedRead(file);
			this.calloutParser(fileContents);
			this.spacedRepetitionParser(fileContents);
			this.quiz = new QuizModal(this.app, this.plugin, this.questionsAndAnswers);
			this.quiz.disableSave();
			this.quiz.open();
		} else {
			new Notice("No active file.");
		}
	}

	private calloutParser(fileContents: string): void {
		const regexMC = />\s*\[!question]\+?\s*(.+)\s*>\s*a\)\s*(.+)\s*>\s*b\)\s*(.+)\s*>\s*c\)\s*(.+)\s*>\s*d\)\s*(.+)\s*>>\s*\[!success]\s*(.+)\s*>>\s*([abcd])\)\s*(.+)/gim;

		let match;
		while ((match = regexMC.exec(fileContents)) !== null) {
			const question = match[1];
			const choice1 = match[2];
			const choice2 = match[3];
			const choice3 = match[4];
			const choice4 = match[5];
			const answerString = match[7];

			this.questionsAndAnswers.push({
				questionMC: question,
				1: choice1,
				2: choice2,
				3: choice3,
				4: choice4,
				answer: this.multipleChoiceAnswer(answerString)
			} as ParsedMC);
		}

		const regexTF = />\s*\[!question]\+?\s*(.+)\s*>\s*True or false\?\s*>>\s*\[!success]\s*(.+)\s*>>\s*(.+)/gim;

		while ((match = regexTF.exec(fileContents)) !== null) {
			const question = match[1];
			const answerString = match[3];

			this.questionsAndAnswers.push({
				questionTF: question,
				answer: answerString.toLowerCase() === "true"
			} as ParsedTF);
		}

		const regexSA = />\s*\[!question]\+?\s*([^>]+)\s*>>\s*\[!success]\s*(.+)\s*>>\s*(.+)/gim;

		while ((match = regexSA.exec(fileContents)) !== null) {
			const question = match[1];
			const answerString = match[3];

			this.questionsAndAnswers.push({
				questionSA: question,
				answer: answerString
			} as ParsedSA);
		}
	}

	private spacedRepetitionParser(fileContents: string): void {
		const regexMC = new RegExp(`\\*\\*Multiple Choice:\\*\\*\\s*(.+)\\s*a\\)\\s*(.+)\\s*b\\)\\s*(.+)\\s*c\\)\\s*(.+)\\s*d\\)\\s*(.+)\\s*\\${this.plugin.settings.multilineSeparator}\\s*([abcd])\\)\\s*(.+)`, "gim");

		let match;
		while ((match = regexMC.exec(fileContents)) !== null) {
			const question = match[1];
			const choice1 = match[2];
			const choice2 = match[3];
			const choice3 = match[4];
			const choice4 = match[5];
			const answerString = match[6];

			this.questionsAndAnswers.push({
				questionMC: question,
				1: choice1,
				2: choice2,
				3: choice3,
				4: choice4,
				answer: this.multipleChoiceAnswer(answerString)
			} as ParsedMC);
		}

		const regexTF = new RegExp(`\\*\\*True\\/False:\\*\\*\\s*(.+)\\s*${this.plugin.settings.inlineSeparator}\\s*(true|false)`, "gim");

		while ((match = regexTF.exec(fileContents)) !== null) {
			const question = match[1];
			const answerString = match[2];

			this.questionsAndAnswers.push({
				questionTF: question,
				answer: answerString.toLowerCase() === "true"
			} as ParsedTF);
		}

		const regexSA = new RegExp(`\\*\\*Short Answer:\\*\\*\\s*(.+)\\s*${this.plugin.settings.inlineSeparator}\\s*(.+)`, "gim");

		while ((match = regexSA.exec(fileContents)) !== null) {
			const question = match[1];
			const answerString = match[2];

			this.questionsAndAnswers.push({
				questionSA: question,
				answer: answerString
			} as ParsedSA);
		}
	}

	private multipleChoiceAnswer(answerString: string): number {
		switch (answerString) {
			case "a":
				return 1;
			case "b":
				return 2;
			case "c":
				return 3;
			case "d":
				return 4;
			default:
				new Notice("Invalid multiple choice callout format.");
				return -1;
		}
	}

}
