import { App, TFile, Notice } from "obsidian";
import QuizGenerator from "../main";
import QuizUI from "../ui/quizUI";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA } from "../utils/types";

export default class QuizRevisitor {
	private app: App;
	private readonly plugin: QuizGenerator;
	private quiz: QuizUI;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];

	constructor(app: App, plugin: QuizGenerator) {
		this.app = app;
		this.plugin = plugin;
	}

	public async openQuiz(): Promise<void> {
		const currentFile = this.app.workspace.getActiveFile();

		if (currentFile instanceof TFile) {
			const fileContents = await this.app.vault.cachedRead(currentFile);
			console.log(JSON.stringify(fileContents));
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
		const regexMC = />\s*\[!question]\s*(.+)\\n>\s*(.+)\\n>\s*(.+)\\n>\s*(.+)\\n>\s*(.+)\\n>>\s*\[!success]\s*(.+)\\n>>(.+?)\\n/gim;

		let match;
		while ((match = regexMC.exec(fileContents)) !== null) {
			const [, questionMC, , , choice1, choice2, choice3, choice4, answer] = match;
			this.questionsAndAnswers.push({
				questionMC,
				1: choice1,
				2: choice2,
				3: choice3,
				4: choice4,
				answer: parseInt(answer, 10)
			});
		}

		const regexTF = />\s*\[!question]\s*(.+)\\n>\s*True or false\?\\n>>\s*\[!success]\s*(.+)\\n>>\s*(.+?)\\n/gim;

		while ((match = regexTF.exec(fileContents)) !== null) {
			const [, questionTF, answer] = match;
			this.questionsAndAnswers.push({
				questionTF,
				answer: answer.toLowerCase() === 'true'
			});
		}

		const regexSA = />\s*\[!question]\s*([^>]+?)\\n>>\s*\[!success]\s*(.+)\\n>>\s*(.+?)\\n/gim;

		while ((match = regexSA.exec(fileContents)) !== null) {
			const [, questionSA, answer] = match;
			this.questionsAndAnswers.push({
				questionSA,
				answer: answer.trim()
			});
		}
	}

	private spacedRepetitionParser(fileContents: string): void {

	}
}
