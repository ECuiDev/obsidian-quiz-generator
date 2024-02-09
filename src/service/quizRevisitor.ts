import { App, TFile, Notice } from "obsidian";
import QuizGenerator from "../main";
import QuizUI from "../ui/quizUI";
import { ParsedMC, ParsedTF, ParsedSA } from "../utils/types";

export default class QuizRevisitor {
	private app: App;
	private readonly plugin: QuizGenerator;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];

	constructor(app: App, plugin: QuizGenerator) {
		this.app = app;
		this.plugin = plugin;
		this.questionsAndAnswers = [];
	}

	public async openQuiz(): Promise<void> {
		const currentFile = this.app.workspace.getActiveFile();

		if (currentFile instanceof TFile) {
			const fileContents = await this.app.vault.cachedRead(currentFile);
			console.log(fileContents);
			this.calloutParser(fileContents);
			new QuizUI(this.app, this.plugin, this.questionsAndAnswers).open();
		}
	}

	private async parseCurrentFile(): Promise<void> {
		const currentFile = this.app.workspace.getActiveFile();

		if (currentFile instanceof TFile) {
			const fileContents = await this.app.vault.cachedRead(currentFile);
		} else {
			new Notice("No active file.");
		}
	}

	private calloutParser(fileContents: string): void {
		const regexMC = />\s*\[!question]\s*(.+)\s*>\s*a\)\s*(.+)\s*>\s*b\)\s*(.+)\s*>\s*c\)\s*(.+)\s*>\s*d\)\s*(.+)\s*>>\s*\[!success]\s*(.+)\s*>>\s*([abcd])\)\s*(.+)/gim;

		let match;
		while ((match = regexMC.exec(fileContents)) !== null) {
			const question = match[1];
			const choice1 = match[2].replace("a) ", "");
			const choice2 = match[3].replace("b) ", "");
			const choice3 = match[4].replace("c) ", "");
			const choice4 = match[5].replace("d) ", "");
			const answerString = match[7];

			let answer = -1;
			switch (answerString) {
				case "a":
					answer = 1;
					break;
				case "b":
					answer = 2;
					break;
				case "c":
					answer = 3;
					break;
				case "d":
					answer = 4;
					break;
				default:
					new Notice("Invalid multiple choice callout format.");
					break;
			}

			this.questionsAndAnswers.push({
				questionMC: question,
				1: choice1,
				2: choice2,
				3: choice3,
				4: choice4,
				answer: answer
			} as ParsedMC);
		}

		const regexTF = />\s*\[!question]\s*(.+)\s*>\s*True or false\?\s*>>\s*\[!success]\s*(.+)\s*>>\s*(.+)/gim;

		while ((match = regexTF.exec(fileContents)) !== null) {
			const question = match[1];
			const answerString = match[3];

			this.questionsAndAnswers.push({
				questionTF: question,
				answer: answerString.toLowerCase() === "true"
			} as ParsedTF);
		}

		const regexSA = />\s*\[!question]\s*([^>]+)\s*>>\s*\[!success]\s*(.+)\s*>>\s*(.+)/gim;

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

	}
}
