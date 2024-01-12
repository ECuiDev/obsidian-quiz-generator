import { App, Modal, Notice, TFile, TFolder, setIcon, setTooltip } from "obsidian";
import GptService from "../service/gptService";
import QuizGenerator from "../main";
import { cleanUpString } from "../utils/parser";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import NoteAdder from "./noteAdder";
import FolderAdder from "./folderAdder";
import "styles.css";
import QuizUI from "./quizUI";

export default class SelectorUI extends Modal {
	private plugin: QuizGenerator;
	private notePaths: string[];
	private folderPaths: string[];
	private selectedNotes: Map<string, string>;
	private notesContainer: HTMLDivElement;
	private buttonContainer: HTMLDivElement;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private clearButton: HTMLButtonElement;
	private quizButton: HTMLButtonElement;
	private addNoteButton: HTMLButtonElement;
	private addFolderButton: HTMLButtonElement;
	private generateButton: HTMLButtonElement;
	private clearListener: () => void;
	private quizListener: () => void;
	private addNoteListener: () => void;
	private addFolderListener: () => void;
	private generateListener: () => void;
	private gpt: GptService;
	private quiz: QuizUI;

	constructor(app: App, plugin: QuizGenerator) {
		super(app);
		this.plugin = plugin;
	}

	public onOpen() {
		this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
		this.folderPaths = this.app.vault.getAllLoadedFiles()
			.filter(abstractFile => abstractFile instanceof TFolder)
			.map(folder => folder.path);
		this.selectedNotes = new Map<string, string>();
		this.questionsAndAnswers = [];

		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.setText("Selected Notes");
		this.titleEl.addClass("title-style");

		this.displayNoteContainer();
		this.displayTokens();
		this.activateButtons();
		this.displayButtons();

		this.clearButton.disabled = true;
		this.quizButton.disabled = true;
		this.generateButton.disabled = true;
	}

	public onClose() {
		super.onClose();
	}

	private displayNoteContainer() {
		this.notesContainer = this.contentEl.createDiv("notes-container");
	}

	private activateButtons() {
		this.clearListener = async () => {
			this.generateButton.disabled = true;
			this.clearButton.disabled = true;
			this.selectedNotes.clear();
			this.notesContainer.empty();
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
			this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path); // remove if performance issues
			this.folderPaths = this.app.vault.getAllLoadedFiles()
				.filter(abstractFile => abstractFile instanceof TFolder)
				.map(folder => folder.path); // remove if this causes performance issues for large vaults
		}

		this.quizListener = async () => this.quiz.open();

		this.addNoteListener = async () => await this.showNoteAdder();

		this.addFolderListener = async () => await this.showFolderAdder();

		this.generateListener = async () => {
			if (this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse
				|| this.plugin.settings.generateShortAnswer) {
				this.generateButton.disabled = true;
				new Notice("Generating...");
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

				this.quiz = new QuizUI(this.app, this.plugin, this.questionsAndAnswers);
				this.quiz.open();

				// this.containerEl.style.display = "none"; KEEP or REMOVE?

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
				this.generateButton.disabled = false;
				this.quizButton.disabled = false;
			} else {
				new Notice("Generation cancelled because all question types are set to false.")
			}
		}
	}

	private displayButtons() {
		this.buttonContainer = this.contentEl.createDiv("selector-button-container");

		this.clearButton = this.buttonContainer.createEl("button");
		this.clearButton.addClass("ui-button");
		setIcon(this.clearButton, "book-x");
		setTooltip(this.clearButton, "Remove all");

		this.quizButton = this.buttonContainer.createEl("button");
		this.quizButton.addClass("ui-button");
		setIcon(this.quizButton, "scroll-text");
		setTooltip(this.quizButton, "Open quiz");

		this.addNoteButton = this.buttonContainer.createEl("button");
		this.addNoteButton.addClass("ui-button");
		setIcon(this.addNoteButton, "file-plus-2");
		setTooltip(this.addNoteButton, "Add note");

		this.addFolderButton = this.buttonContainer.createEl("button");
		this.addFolderButton.addClass("ui-button");
		setIcon(this.addFolderButton, "folder-plus");
		setTooltip(this.addFolderButton, "Add folder");

		this.generateButton = this.buttonContainer.createEl("button");
		this.generateButton.addClass("ui-button");
		setIcon(this.generateButton, "webhook");
		setTooltip(this.generateButton, "Generate");

		this.clearButton.addEventListener("click", this.clearListener);
		this.quizButton.addEventListener("click", this.quizListener);
		this.addNoteButton.addEventListener("click", this.addNoteListener);
		this.addFolderButton.addEventListener("click", this.addFolderListener);
		this.generateButton.addEventListener("click", this.generateListener);
	}

	private displayTokens() {
		this.tokenSection = this.contentEl.createSpan("token-container");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async showNoteAdder() {
		const modal = new NoteAdder(this.app, this.notePaths);

		modal.setCallback(async (selectedItem: string) => {
			const selectedNote = this.app.vault.getAbstractFileByPath(selectedItem);

			if (selectedNote instanceof TFile) {
				this.notePaths.remove(selectedNote.path); // remove if this causes performance issues for large vaults
				await this.showNoteAdder();
				const noteContents = cleanUpString(await this.app.vault.cachedRead(selectedNote));
				this.selectedNotes.set(selectedNote.path, noteContents);
				await this.displayNote(selectedNote);
			}
		});

		modal.open();
	}

	private async showFolderAdder() {
		const modal = new FolderAdder(this.app, this.folderPaths);

		modal.setCallback(async (selectedItem: string) => {
			const selectedFolder = this.app.vault.getAbstractFileByPath(selectedItem);

			if (selectedFolder instanceof TFolder) {
				this.folderPaths.remove(selectedFolder.path);
				await this.showFolderAdder();
				const folderNotes = selectedFolder.children
					.filter(child => child instanceof TFile && child.extension === "md");

				let folderNoteContents: string[] = [];

				for (const file of folderNotes) {
					if (file instanceof TFile) {
						folderNoteContents.push(cleanUpString(await this.app.vault.cachedRead(file)));
					}
				}

				this.selectedNotes.set(selectedFolder.path, folderNoteContents.join(" "));
				await this.displayFolder(selectedFolder);
			}
		});

		modal.open();
	}

	private async displayNote(note: TFile) {
		this.clearButton.disabled = false;
		this.generateButton.disabled = false;

		const selectedNoteBox = this.notesContainer.createDiv("notes-container-element");
		this.plugin.settings.showNotePath ?
			selectedNoteBox.textContent = note.path : selectedNoteBox.textContent = note.basename;

		const noteTokensElement = selectedNoteBox.createDiv("note-tokens");
		const noteTokens = await this.countNoteTokens(this.selectedNotes.get(note.path));
		noteTokensElement.textContent = noteTokens + " tokens";

		const removeButton = selectedNoteBox.createEl("button");
		removeButton.addClass("remove-button");
		setIcon(removeButton, "x");
		setTooltip(removeButton, "Remove");
		removeButton.addEventListener("click", async () => {
			this.notesContainer.removeChild(selectedNoteBox);
			this.notePaths.push(note.path); // remove if this causes performance issues for large vaults
			this.selectedNotes.delete(note.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

			if (this.selectedNotes.size === 0) {
				this.clearButton.disabled = true;
				this.generateButton.disabled = true;
			}
		});

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async displayFolder(folder: TFolder) {
		this.clearButton.disabled = false;
		this.generateButton.disabled = false;

		const selectedFolderBox = this.notesContainer.createDiv("notes-container-element");

		if (folder.path === "/") {
			selectedFolderBox.textContent = this.app.vault.getName() + " (Vault)";
		} else {
			this.plugin.settings.showFolderPath ?
				selectedFolderBox.textContent = folder.path : selectedFolderBox.textContent = folder.name;
		}

		const noteTokensElement = selectedFolderBox.createDiv("note-tokens");
		const noteTokens = await this.countNoteTokens(this.selectedNotes.get(folder.path));
		noteTokensElement.textContent = noteTokens + " tokens";

		const removeButton = selectedFolderBox.createEl("button");
		removeButton.addClass("remove-button");
		setIcon(removeButton, "x");
		setTooltip(removeButton, "Remove");
		removeButton.addEventListener("click", async () => {
			this.notesContainer.removeChild(selectedFolderBox);
			this.folderPaths.push(folder.path); // remove if this causes performance issues for large vaults
			this.selectedNotes.delete(folder.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

			if (this.selectedNotes.size === 0) {
				this.clearButton.disabled = true;
				this.generateButton.disabled = true;
			}
		});

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async countNoteTokens(noteContents: string | undefined) {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	}

	private async loadNoteContents() {
		const noteContents: string[] = [];

		for (const noteContent of this.selectedNotes.values()) {
			noteContents.push(noteContent);
		}

		return noteContents;
	}

}
