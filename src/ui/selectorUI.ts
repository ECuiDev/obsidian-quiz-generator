import { App, Modal, Notice, TFile, TFolder, setIcon, setTooltip, normalizePath } from "obsidian";
import GptService from "../service/gptService";
import QuizGenerator from "../main";
import { cleanUpString } from "../utils/parser";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import NoteAdder from "./noteAdder";
import "styles.css";
import QuizUI from "./quizUI";

export default class SelectorUI extends Modal {
	private readonly plugin: QuizGenerator;
	private allMarkdownFiles: TFile[];
	private noteNames: string[];
	private selectedNotes: Map<string, string>;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private clearListener: () => void;
	private addNoteListener: () => void;
	private generateListener: () => void;
	private gpt: GptService;
	private fileName: string;
	private validPath: boolean;
	private fileCreated: boolean;

	constructor(app: App, plugin: QuizGenerator) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen() {
		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.selectedNotes = new Map<string, string>();
		this.questionsAndAnswers = [];

		this.modalEl.addClass("selected-notes-container");
		this.titleEl.setText("Selected Notes");
		this.titleEl.addClass("selected-notes-title");
		this.contentEl.addClass("notes-section");

		this.activateButtons();
		this.displayButtons();
		this.displayTokens();
		this.chooseFileName();
	}

	public onClose() {
		super.onClose();
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

	private displayButtons() {
		const buttonSectionLeft = this.modalEl.createDiv("left-buttons-container");

		const clear = buttonSectionLeft.createEl("button");
		clear.addClass("selector-button", "special");
		setIcon(clear, "book-x");
		setTooltip(clear, "Remove all");

		const buttonSectionRight = this.modalEl.createDiv("right-buttons-container");

		const addNote = buttonSectionRight.createEl("button");
		addNote.addClass("selector-button");
		setIcon(addNote, "file-plus-2");
		setTooltip(addNote, "Add note");

		const addFolder = buttonSectionRight.createEl("button");
		addFolder.addClass("selector-button");
		setIcon(addFolder, "folder-plus");
		setTooltip(addFolder, "Add folder");

		const generate = buttonSectionRight.createEl("button");
		generate.addClass("selector-button");
		setIcon(generate, "brain-circuit");
		setTooltip(generate, "Generate");

		clear.addEventListener("click", this.clearListener);
		addNote.addEventListener("click", this.addNoteListener);
		generate.addEventListener("click", this.generateListener);
	}

	private displayTokens() {
		this.tokenSection = this.modalEl.createSpan("token-section");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private activateButtons() {
		this.clearListener = async () => {
			this.selectedNotes.clear();
			this.contentEl.empty();
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
			this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		}

		this.addNoteListener = async () => await this.showNoteAdder();

		this.generateListener = async () => {
			if (this.selectedNotes.size === 0) {
				new Notice("No notes selected");
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
									this.questionsAndAnswers.push(element as ParsedMC);
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

				this.containerEl.style.display = "none";

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
		const selectedNoteBox = this.contentEl.createDiv("selected-note-box");
		selectedNoteBox.textContent = selectedNote;

		const noteTokensElement = selectedNoteBox.createDiv("note-tokens");
		const noteTokens = await this.countNoteTokens(this.selectedNotes.get(selectedNote));
		noteTokensElement.textContent = noteTokens + " tokens";

		const removeButton = selectedNoteBox.createEl("button");
		removeButton.addClass("remove-button");
		setIcon(removeButton, "x");
		setTooltip(removeButton, "Remove");
		removeButton.addEventListener("click", async () => {
			this.contentEl.removeChild(selectedNoteBox);
			this.noteNames.push(selectedNote);
			this.selectedNotes.delete(selectedNote);
		})

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
