import { App, Notice, TFile, TFolder, normalizePath } from "obsidian";
import GptService from "../service/gptService";
import QuizGenerator from "../main";
import { cleanUpString } from "../utils/parser";
import { ParsedQuestions, ParsedMCQ, ParsedTF, ParsedSA } from "../utils/types";
import NoteAdder from "./noteAdder";
import "styles.css";
import QuizUI from "./quizUI";

export default class SelectorUI {
	private readonly app: App;
	private readonly plugin: QuizGenerator;
	private allMarkdownFiles: TFile[];
	private noteNames: string[];
	private selectedNotes: Map<string, string>;
	private selectedNotesContainer: HTMLDivElement;
	private elementsSection: HTMLDivElement;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private questionsAndAnswers: (ParsedMCQ | ParsedTF | ParsedSA)[];
	private exitListener: () => void;
	private clearListener: () => void;
	private addListener: () => void;
	private generateListener: () => void;
	private gpt: GptService;
	private fileName: string;
	private validPath: boolean;
	private fileCreated: boolean;

	constructor(app: App, plugin: QuizGenerator) {
		this.app = app;
		this.plugin = plugin;

		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.selectedNotes = new Map<string, string>();
		this.questionsAndAnswers = [];
		this.displaySearchUI();
		this.chooseFileName();
	}

	private close() {
		document.body.removeChild(this.selectedNotesContainer);
	}

	private displaySearchUI() {
		this.displaySelectedNotesContainer();
		this.activateButtons();
		this.displaySearchButtons();
		this.displaySearchElements();
		this.displayTokens();
	}

	private async showNoteAdder() {
		const modal = new NoteAdder(this.app, this.noteNames);

		modal.setCallback(async (selectedItem: string) => {
			const selectedNote = this.getNoteByName(selectedItem);

			if (selectedNote) {
				this.noteNames.remove(selectedNote.basename);
				await this.showNoteAdder();
				const noteContents = cleanUpString(await this.app.vault.cachedRead(selectedNote));
				this.selectedNotes.set(selectedNote.basename, noteContents);
				await this.displaySelectedNote(selectedNote.basename);
			}
		});

		modal.open();
	}

	private displaySelectedNotesContainer() {
		this.selectedNotesContainer = document.createElement("div");
		this.selectedNotesContainer.id = "selected-notes-container";
		this.selectedNotesContainer.classList.add("selected-notes-container");
		
		document.body.appendChild(this.selectedNotesContainer);
	}

	private displaySearchButtons() {
		const buttonSectionLeft = document.createElement("div");
		buttonSectionLeft.id = "left-buttons-container";
		buttonSectionLeft.classList.add("left-buttons-container");

		const exit = document.createElement("button");
		exit.textContent = "Exit";
		exit.id = "exit";
		exit.classList.add("exit");

		const clear = document.createElement("button");
		clear.textContent = "Clear All";
		clear.id = "clear";
		clear.classList.add("clear");

		buttonSectionLeft.appendChild(exit);
		buttonSectionLeft.appendChild(clear);
		this.selectedNotesContainer.appendChild(buttonSectionLeft);

		const buttonSectionRight = document.createElement("div");
		buttonSectionRight.id = "right-buttons-container";
		buttonSectionRight.classList.add("right-buttons-container");

		const add = document.createElement("button");
		add.textContent = "Add";
		add.id = "add";
		add.classList.add("add");

		const generate = document.createElement("button");
		generate.textContent = "Generate";
		generate.id = "generate";
		generate.classList.add("generate");

		buttonSectionRight.appendChild(add);
		buttonSectionRight.appendChild(generate);
		this.selectedNotesContainer.appendChild(buttonSectionRight);

		exit.addEventListener("click", this.exitListener);
		clear.addEventListener("click", this.clearListener);
		add.addEventListener("click", this.addListener);
		generate.addEventListener("click", this.generateListener);
	}

	private displaySearchElements() {
		this.elementsSection = document.createElement("div");
		this.elementsSection.id = "elements-section";
		this.elementsSection.classList.add("elements-section");

		this.selectedNotesContainer.appendChild(this.elementsSection);
	}

	private displayTokens() {
		this.tokenSection = document.createElement("span");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
		this.tokenSection.id = "token-section";
		this.tokenSection.classList.add("token-section");

		this.selectedNotesContainer.appendChild(this.tokenSection);
	}

	private activateButtons() {
		this.exitListener = async () => this.close();

		this.clearListener = async () => {
			this.selectedNotes.clear();
			this.elementsSection.empty();
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
			this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		}

		this.addListener = async () => await this.showNoteAdder();

		this.generateListener = async () => {
			if (this.selectedNotes.size === 0) {
				new Notice("No notes selected.");
			} else if (this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse
				|| this.plugin.settings.generateShortAnswer) {
				const temp = JSON.parse(new GptService(this.plugin).exampleResponse());
				const temp2 = temp.quiz;

				for (const key in temp) {
					if(temp.hasOwnProperty(key)) {
						const value = temp[key];

						if (Array.isArray(value)) {
							value.forEach(element => {
								if ("QuestionMC" in element) {
									this.questionsAndAnswers.push(element as ParsedMCQ);
								} else if ("QuestionTF" in element) {
									this.questionsAndAnswers.push(element as ParsedTF);
								} else if ("QuestionSA" in element) {
									this.questionsAndAnswers.push(element as ParsedSA);
								}
							});
						}
					}
				}

				console.log(this.questionsAndAnswers);

				new QuizUI(this.questionsAndAnswers);

				this.selectedNotesContainer.style.display = "none";
				this.elementsSection.style.display = "none";

				//new QuizUI(JSON.parse(new GptService(this.plugin).exampleResponse()));
				//this.close();
				/*
				this.gpt = new GptService(this.plugin);
				const questions = await this.gpt.generateQuestions(await this.loadNoteContents());

				console.log(questions);
				console.log(JSON.stringify(questions));

				if (questions != null) {
					const parsedJSON: ParsedQuestions = JSON.parse(questions);

					console.log(parsedJSON);
					console.log(JSON.stringify(parsedJSON));

					this.questionsAndAnswers = parsedJSON.quiz;
					new QuizUI(this.questionsAndAnswers);
				} else {
					new Notice("json variable is null");
				}*/
			} else {
				new Notice("Generation cancelled because all question types are set to false.")
			}
		}
	}

	private async displaySelectedNote(selectedNote: string) {
		const selectedNoteBox = document.createElement("div");
		selectedNoteBox.textContent = selectedNote;
		selectedNoteBox.id = "selected-note-box";
		selectedNoteBox.classList.add("selected-note-box");

		const noteTokensElement = document.createElement("div");
		const noteTokens = await this.countNoteTokens(this.selectedNotes.get(selectedNote));
		noteTokensElement.textContent = noteTokens + " tokens";
		noteTokensElement.id = "note-tokens";
		noteTokensElement.classList.add("note-tokens");

		selectedNoteBox.appendChild(noteTokensElement);

		this.elementsSection.appendChild(selectedNoteBox);

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async loadNoteContents() {
		const noteContents: string[] = [];

		for (const noteContent of this.selectedNotes.values()) {
			noteContents.push(noteContent);
		}

		return noteContents;
	}

	private async countNoteTokens(noteContents: string | undefined) {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	}

	private getNoteByName(noteName: string): TFile | null {
		return this.allMarkdownFiles.find(file => file.basename === noteName) || null;
	}

	private chooseFileName() {
		let count = 1;
		const folder =
			this.app.vault.getAbstractFileByPath(normalizePath(this.plugin.settings.questionSavePath.trim()));

		if (folder instanceof TFolder) {
			const fileNames = folder.children
				.filter(file => file instanceof TFile)
				.map(file => file.name.toLowerCase())
				.filter(name => name.startsWith("quiz"));

			while (fileNames.includes(`quiz ${count}.md`)) {
				count++;
			}

			this.fileName = `Quiz ${count}.md`;
			this.validPath = true;
		} else {
			const rootFileNames = this.app.vault.getRoot().children
				.filter(file => file instanceof TFile)
				.map(file => file.name.toLowerCase())
				.filter(name => name.startsWith("quiz"));

			while (rootFileNames.includes(`quiz ${count}.md`)) {
				count++;
			}

			this.fileName = `Quiz ${count}.md`;
			this.validPath = false;
		}
	}

}
