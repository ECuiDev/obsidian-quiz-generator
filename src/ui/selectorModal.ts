import { App, getFrontMatterInfo, Modal, Notice, setIcon, setTooltip, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { ParsedMC, ParsedQuestions, ParsedSA, ParsedTF } from "../utils/types";
import { cleanUpNoteContents } from "../utils/parser";
import GptGenerator from "../generators/gptGenerator";
import QuizGenerator from "../main";
import NoteAndFolderSelector from "./noteAndFolderSelector";
import QuizModal from "./quizModal";
import "styles.css";

export default class SelectorModal extends Modal {
	private readonly plugin: QuizGenerator;
	private notePaths: string[];
	private folderPaths: string[];
	private selectedNotes: Map<string, string> = new Map<string, string>();
	private notesContainer: HTMLDivElement;
	private buttonContainer: HTMLDivElement;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private readonly clearButton: HTMLButtonElement;
	private readonly openQuizButton: HTMLButtonElement;
	private readonly addNoteButton: HTMLButtonElement;
	private readonly addFolderButton: HTMLButtonElement;
	private readonly generateQuizButton: HTMLButtonElement;
	private readonly clearHandler: () => void;
	private readonly openQuizHandler: () => void;
	private readonly addNoteHandler: () => void;
	private readonly addFolderHandler: () => void;
	private readonly generateQuizHandler: () => void;
	private quiz: QuizModal | undefined;

	constructor(app: App, plugin: QuizGenerator) {
		super(app);
		this.plugin = plugin;
		this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
		this.folderPaths = this.app.vault.getAllLoadedFiles()
			.filter(abstractFile => abstractFile instanceof TFolder)
			.map(folder => folder.path);

		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.setText("Selected Notes");
		this.titleEl.addClass("title-style");

		this.notesContainer = this.contentEl.createDiv("notes-container");

		this.tokenSection = this.contentEl.createSpan("token-container");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

		this.clearHandler = (): void => {
			this.generateQuizButton.disabled = true;
			this.clearButton.disabled = true;
			this.selectedNotes.clear();
			this.notesContainer.empty();
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
			this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
			this.folderPaths = this.app.vault.getAllLoadedFiles()
				.filter(abstractFile => abstractFile instanceof TFolder)
				.map(folder => folder.path);
		};
		this.openQuizHandler = (): void => this.quiz?.open();
		this.addNoteHandler = (): void => this.showNoteAdder();
		this.addFolderHandler = (): void => this.showFolderAdder();
		this.generateQuizHandler = async (): Promise<void> => {
			if ((this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse
				|| this.plugin.settings.generateShortAnswer) && this.promptTokens > 0) {
				this.generateQuizButton.disabled = true;
				const questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[] = [];
				const generator = new GptGenerator(this.plugin);

				new Notice("Generating...");
				let questions = await generator.generateQuestions([...this.selectedNotes.values()]);
				questions = questions?.replace(/\\/g, "\\\\");

				if (questions) {
					try {
						const parsedQuestions: ParsedQuestions = JSON.parse(questions);

						for (const key in parsedQuestions) {
							if (parsedQuestions.hasOwnProperty(key)) {
								const value = parsedQuestions[key];

								if (Array.isArray(value)) {
									value.forEach(element => {
										if ("questionMC" in element) {
											questionsAndAnswers.push(element as ParsedMC);
										} else if ("questionTF" in element) {
											questionsAndAnswers.push(element as ParsedTF);
										} else if ("questionSA" in element) {
											questionsAndAnswers.push(element as ParsedSA);
										} else {
											new Notice("A question was generated incorrectly");
										}
									});
								} else {
									new Notice("Failure: Generation returned incorrect format");
								}
							}
						}

						this.quiz = new QuizModal(this.app, this.plugin, questionsAndAnswers);
						this.quiz.open();
					} catch (error: any) {
						new Notice(error);
					}
				} else {
					new Notice("Failure: Generation returned null");
				}

				this.generateQuizButton.disabled = false;
				this.openQuizButton.disabled = false;
			} else {
				new Notice("Generation cancelled because all question types are set to false or prompt contains 0 tokens");
			}
		};

		this.buttonContainer = this.contentEl.createDiv("selector-button-container");
		this.clearButton = this.buttonContainer.createEl("button");
		this.openQuizButton = this.buttonContainer.createEl("button");
		this.addNoteButton = this.buttonContainer.createEl("button");
		this.addFolderButton = this.buttonContainer.createEl("button");
		this.generateQuizButton = this.buttonContainer.createEl("button");
		this.activateButtons();
	}

	public onOpen(): void {
		super.onOpen();
		this.clearButton.disabled = true;
		this.openQuizButton.disabled = true;
		this.generateQuizButton.disabled = true;
	}

	public onClose(): void {
		super.onClose();
	}

	private activateButtons(): void {
		this.clearButton.addClass("ui-button");
		setIcon(this.clearButton, "book-x");
		setTooltip(this.clearButton, "Remove all");

		this.openQuizButton.addClass("ui-button");
		setIcon(this.openQuizButton, "scroll-text");
		setTooltip(this.openQuizButton, "Open quiz");

		this.addNoteButton.addClass("ui-button");
		setIcon(this.addNoteButton, "file-plus-2");
		setTooltip(this.addNoteButton, "Add note");

		this.addFolderButton.addClass("ui-button");
		setIcon(this.addFolderButton, "folder-plus");
		setTooltip(this.addFolderButton, "Add folder");

		this.generateQuizButton.addClass("ui-button");
		setIcon(this.generateQuizButton, "webhook");
		setTooltip(this.generateQuizButton, "Generate");

		this.clearButton.addEventListener("click", this.clearHandler);
		this.openQuizButton.addEventListener("click", this.openQuizHandler);
		this.addNoteButton.addEventListener("click", this.addNoteHandler);
		this.addFolderButton.addEventListener("click", this.addFolderHandler);
		this.generateQuizButton.addEventListener("click", this.generateQuizHandler);
	}

	private showNoteAdder(): void {
		const modal = new NoteAndFolderSelector(this.app, this.notePaths, this.modalEl);

		modal.setCallback(async (selectedItem: string): Promise<void> => {
			const selectedNote = this.app.vault.getFileByPath(selectedItem);

			if (selectedNote instanceof TFile) {
				this.notePaths.remove(selectedNote.path);
				this.showNoteAdder();
				const noteContents = await this.app.vault.cachedRead(selectedNote);
				const hasFrontMatter = getFrontMatterInfo(noteContents).exists;
				this.selectedNotes.set(selectedNote.path, cleanUpNoteContents(noteContents, hasFrontMatter));
				this.displayNote(selectedNote);
			}
		});

		modal.open();
	}

	private showFolderAdder(): void {
		const modal = new NoteAndFolderSelector(this.app, this.folderPaths, this.modalEl);

		modal.setCallback(async (selectedItem: string): Promise<void> => {
			const selectedFolder = this.app.vault.getFolderByPath(selectedItem);

			if (selectedFolder instanceof TFolder) {
				this.folderPaths.remove(selectedFolder.path);
				this.showFolderAdder();

				let folderContents: string[] = [];
				const promises: any[] = [];

				Vault.recurseChildren(selectedFolder, (file: TAbstractFile): void => {
					if (file instanceof TFile && file.extension === "md") {
						promises.push(
							(async (): Promise<void> => {
								const noteContents = await this.app.vault.cachedRead(file);
								const hasFrontMatter = getFrontMatterInfo(noteContents).exists;
								folderContents.push(cleanUpNoteContents(noteContents, hasFrontMatter));
							})()
						);
					}
				});

				await Promise.all(promises);

				this.selectedNotes.set(selectedFolder.path, folderContents.join(" "));
				this.displayFolder(selectedFolder);
			}
		});

		modal.open();
	}

	private displayNote(note: TFile): void {
		this.clearButton.disabled = false;
		this.generateQuizButton.disabled = false;

		const selectedNoteBox = this.notesContainer.createDiv("notes-container-element");
		this.plugin.settings.showNotePath ?
			selectedNoteBox.textContent = note.path : selectedNoteBox.textContent = note.basename;

		const noteTokensElement = selectedNoteBox.createDiv("note-tokens");
		const noteTokens = this.countNoteTokens(this.selectedNotes.get(note.path));
		noteTokensElement.textContent = noteTokens + " tokens";

		const removeButton = selectedNoteBox.createEl("button");
		removeButton.addClass("remove-button");
		setIcon(removeButton, "x");
		setTooltip(removeButton, "Remove");
		removeButton.addEventListener("click", (): void => {
			this.selectedNotes.delete(note.path);
			this.notesContainer.removeChild(selectedNoteBox);
			this.notePaths.push(note.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

			if (this.selectedNotes.size === 0) {
				this.clearButton.disabled = true;
				this.generateQuizButton.disabled = true;
			}
		});

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private displayFolder(folder: TFolder): void {
		this.clearButton.disabled = false;
		this.generateQuizButton.disabled = false;

		const selectedFolderBox = this.notesContainer.createDiv("notes-container-element");

		if (folder.path === "/") {
			selectedFolderBox.textContent = this.app.vault.getName() + " (Vault)";
		} else {
			this.plugin.settings.showFolderPath ?
				selectedFolderBox.textContent = folder.path : selectedFolderBox.textContent = folder.name;
		}

		const noteTokensElement = selectedFolderBox.createDiv("note-tokens");
		const noteTokens = this.countNoteTokens(this.selectedNotes.get(folder.path));
		noteTokensElement.textContent = noteTokens + " tokens";

		const removeButton = selectedFolderBox.createEl("button");
		removeButton.addClass("remove-button");
		setIcon(removeButton, "x");
		setTooltip(removeButton, "Remove");
		removeButton.addEventListener("click", (): void => {
			this.selectedNotes.delete(folder.path);
			this.notesContainer.removeChild(selectedFolderBox);
			this.folderPaths.push(folder.path);
			this.promptTokens -= noteTokens;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

			if (this.selectedNotes.size === 0) {
				this.clearButton.disabled = true;
				this.generateQuizButton.disabled = true;
			}
		});

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private countNoteTokens(noteContents: string | undefined): number {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	}

}
