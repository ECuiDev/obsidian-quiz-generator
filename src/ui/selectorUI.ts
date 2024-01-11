import { App, Modal, Notice, TFile, TFolder, setIcon, setTooltip, normalizePath } from "obsidian";
import GptService from "../service/gptService";
import QuizGenerator from "../main";
import { cleanUpString } from "../utils/parser";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA } from "../utils/types";
import NoteAdder from "./noteAdder";
import FolderAdder from "./folderAdder";
import "styles.css";
import QuizUI from "./quizUI";

export default class SelectorUI extends Modal {
	private readonly plugin: QuizGenerator;
	private notePaths: string[];
	private folderPaths: string[];
	private selectedNotes: Map<string, string>;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[];
	private clearListener: () => void;
	private addNoteListener: () => void;
	private addFolderListener: () => void;
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
		this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
		this.folderPaths = this.app.vault.getAllLoadedFiles()
			.filter(abstractFile => abstractFile instanceof TFolder)
			.map(folder => folder.path);
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

	private activateButtons() {
		this.clearListener = async () => {
			this.selectedNotes.clear();
			this.contentEl.empty();
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
			this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path); // remove if performance issues
			this.folderPaths = this.app.vault.getAllLoadedFiles()
				.filter(abstractFile => abstractFile instanceof TFolder)
				.map(folder => folder.path); // remove if this causes performance issues for large vaults
		}

		this.addNoteListener = async () => await this.showNoteAdder();

		this.addFolderListener = async () => await this.showFolderAdder();

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

				new QuizUI(this.app, this.questionsAndAnswers).open();

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
		addFolder.addEventListener("click", this.addFolderListener);
		generate.addEventListener("click", this.generateListener);
	}

	private displayTokens() {
		this.tokenSection = this.modalEl.createSpan("token-section");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
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
		const selectedNoteBox = this.contentEl.createDiv("selected-note-box");
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
			this.contentEl.removeChild(selectedNoteBox);
			this.notePaths.push(note.path); // remove if this causes performance issues for large vaults
			this.selectedNotes.delete(note.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
		});

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async displayFolder(folder: TFolder) {
		const selectedFolderBox = this.contentEl.createDiv("selected-note-box");

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
			this.contentEl.removeChild(selectedFolderBox);
			this.folderPaths.push(folder.path); // remove if this causes performance issues for large vaults
			this.selectedNotes.delete(folder.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
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
