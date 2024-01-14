import { App, Vault, Modal, Notice, TFile, TFolder, setIcon, setTooltip } from "obsidian";
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
		}

		this.quizListener = async () => this.quiz.open();

		this.addNoteListener = async () => await this.showNoteAdder();

		this.addFolderListener = async () => await this.showFolderAdder();

		this.generateListener = async () => {
			if ((this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse
				|| this.plugin.settings.generateShortAnswer) && this.promptTokens > 0) {
				this.generateButton.disabled = true;
				this.questionsAndAnswers.length = 0;
				this.gpt = new GptService(this.plugin);

				new Notice("Generating...");
				const questions = await this.gpt.generateQuestions(await this.loadNoteContents());

				console.log(questions);
				console.log(JSON.stringify(questions));

				if (questions) {
					try {
						const parsedQuestions: ParsedQuestions = JSON.parse(questions);

						console.log(parsedQuestions);
						console.log(JSON.stringify(parsedQuestions));

						for (const key in parsedQuestions) {
							if (parsedQuestions.hasOwnProperty(key)) {
								const value = parsedQuestions[key];

								if (Array.isArray(value)) {
									value.forEach(element => {
										if ("QuestionMC" in element) {
											this.questionsAndAnswers.push(element as ParsedMC);
										} else if ("QuestionTF" in element) {
											this.questionsAndAnswers.push(element as ParsedTF);
										} else if ("QuestionSA" in element) {
											this.questionsAndAnswers.push(element as ParsedSA);
										} else {
											new Notice("A question was generated incorrectly");
										}
									});
								} else {
									new Notice("Failure: Generation returned incorrect format");
								}
							}
						}

						this.quiz = new QuizUI(this.app, this.plugin, this.questionsAndAnswers);
						this.quiz.open();
					} catch (error) {
						new Notice(error);
					}
				} else {
					new Notice("Failure: Generation returned null");
				}

				console.log(this.questionsAndAnswers);

				this.generateButton.disabled = false;
				this.quizButton.disabled = false;
			} else {
				new Notice("Generation cancelled because all question types are set to false or prompt contains 0 tokens");
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
		const modal = new NoteAdder(this.app, this.notePaths, this.modalEl);

		modal.setCallback(async (selectedItem: string) => {
			const selectedNote = this.app.vault.getAbstractFileByPath(selectedItem);

			if (selectedNote instanceof TFile) {
				await this.showNoteAdder();
				const noteContents = cleanUpString(await this.app.vault.cachedRead(selectedNote));
				this.selectedNotes.set(selectedNote.path, noteContents);
				await this.displayNote(selectedNote);
			}
		});

		modal.open();
	}

	private async showFolderAdder() {
		const modal = new FolderAdder(this.app, this.folderPaths, this.modalEl);

		modal.setCallback(async (selectedItem: string) => {
			const selectedFolder = this.app.vault.getAbstractFileByPath(selectedItem);

			if (selectedFolder instanceof TFolder) {
				await this.showFolderAdder();

				let folderContents: string[] = [];
				const promises: any[] = [];

				Vault.recurseChildren(selectedFolder, (file) => {
					if (file instanceof TFile && file.extension === "md") {
						promises.push(
							(async () => {
								folderContents.push(cleanUpString(await this.app.vault.cachedRead(file)));
							})()
						);
					}
				});

				await Promise.all(promises);

				this.selectedNotes.set(selectedFolder.path, folderContents.join(" "));
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
