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

	public openQuiz(): void {

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
		const mcRegex = /> \[!question]\s*([^]*?)\n> a\)\s*([^]*?)\n> b\)\s*([^]*?)\n> c\)\s*([^]*?)\n> d\) \s*([^]*?)\n>> \[!success]\s*([^]*?)\n>> b\) \s*([^]*)/gm;

		let match;
		while ((match = mcRegex.exec(fileContents)) !== null) {
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

		const tfRegex = /^\[!question]\s*(.*?)\.\s*True\s*or\s*false\?\s*>>\s*\[!success]-\s*Answer\s*\n>>\s*(\w+)/gm;

		while ((match = tfRegex.exec(fileContents)) !== null) {
			const [, questionTF, answer] = match;
			this.questionsAndAnswers.push({
				questionTF,
				answer: answer.toLowerCase() === 'true'
			});
		}

		const saRegex = /^\[!question]\s*(.*?)\.\s*>>\s*\[!success]-\s*Answer\s*\n>>\s*(.*)/gm;

		while ((match = saRegex.exec(fileContents)) !== null) {
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
