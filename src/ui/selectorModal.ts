import {
	App,
	getFrontMatterInfo,
	Modal,
	Notice,
	Scope,
	setIcon,
	setTooltip,
	TAbstractFile,
	TFile,
	TFolder,
	Vault
} from "obsidian";
import { ParsedMC, ParsedQuestions, ParsedSA, ParsedTF, QuizSettings, SelectorModalButtons } from "../utils/types";
import { cleanUpNoteContents } from "../utils/parser";
import GptGenerator from "../generators/gptGenerator";
import NoteAndFolderSelector from "./noteAndFolderSelector";
import QuizModal from "./quizModal";
import NoteViewerModal from "./noteViewerModal";
import FolderViewerModal from "./folderViewerModal";

export default class SelectorModal extends Modal {
	private readonly settings: QuizSettings;
	private notePaths: string[];
	private folderPaths: string[];
	private selectedNotes: Map<string, string> = new Map<string, string>();
	private notesContainer: HTMLDivElement;
	private tokenContainer: HTMLSpanElement;
	private promptTokens: number = 0;
	private buttonContainer: HTMLDivElement;
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

	constructor(app: App, settings: QuizSettings) {
		super(app);
		this.settings = settings;
		this.notePaths = this.app.vault.getMarkdownFiles().map((file: TFile) => file.path);
		this.folderPaths = this.app.vault.getAllLoadedFiles()
			.filter((abstractFile: TAbstractFile) => abstractFile instanceof TFolder)
			.map((folder: TFolder) => folder.path);
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());

		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText("Selected Notes");

		this.notesContainer = this.contentEl.createDiv("notes-container");
		this.tokenContainer = this.contentEl.createSpan("token-container");
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
		this.buttonContainer = this.contentEl.createDiv("selector-button-container");
		this.clearButton = this.buttonContainer.createEl("button");
		this.openQuizButton = this.buttonContainer.createEl("button");
		this.addNoteButton = this.buttonContainer.createEl("button");
		this.addFolderButton = this.buttonContainer.createEl("button");
		this.generateQuizButton = this.buttonContainer.createEl("button");

		this.clearHandler = (): void => {
			this.toggleButtons(["clear", "generate"], true);
			this.selectedNotes.clear();
			this.notesContainer.empty();
			this.updatePromptTokens(0);
			this.notePaths = this.app.vault.getMarkdownFiles().map((file: TFile) => file.path);
			this.folderPaths = this.app.vault.getAllLoadedFiles()
				.filter((abstractFile: TAbstractFile) => abstractFile instanceof TFolder)
				.map((folder: TFolder) => folder.path);
		};
		this.openQuizHandler = (): void => this.quiz?.open();
		this.addNoteHandler = (): void => this.openNoteSelector();
		this.addFolderHandler = (): void => this.openFolderSelector();
		this.generateQuizHandler = async (): Promise<void> => {
			if (!this.validGenerationSettings()) {
				new Notice("Invalid generation settings or prompt contains 0 tokens");
				return;
			}

			this.toggleButtons(["generate"], true);
			const questionsAndAnswers: (ParsedMC | ParsedTF | ParsedSA)[] = [];
			const generator = new GptGenerator(this.settings);

			new Notice("Generating...");

			const questions = await generator.generateQuestions([...this.selectedNotes.values()]);
			if (!questions) {
				this.toggleButtons(["generate"], false);
				new Notice("Failure: Generation returned nothing");
				return;
			}

			try {
				const parsedQuestions: ParsedQuestions = JSON.parse(questions.replace(/\\/g, "\\\\"));
				for (const key in parsedQuestions) {
					const value = parsedQuestions[key];
					if (!Array.isArray(value)) {
						new Notice("Failure: Generation returned incorrect format");
						continue;
					}

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
				}

				this.quiz = new QuizModal(this.app, this.settings, questionsAndAnswers);
				this.quiz.open();
				this.toggleButtons(["quiz"], false);
			} catch (error: any) {
				new Notice(error);
			} finally {
				this.toggleButtons(["generate"], false);
			}
		};

		this.activateButtons();
	}

	public onOpen(): void {
		super.onOpen();
		this.toggleButtons(["clear", "quiz", "generate"], true);
	}

	public onClose(): void {
		super.onClose();
	}

	private activateButtons(): void {
		this.clearButton.addClass("ui-button");
		this.setIconAndTooltip(this.clearButton, "book-x", "Remove all");

		this.openQuizButton.addClass("ui-button");
		this.setIconAndTooltip(this.openQuizButton, "scroll-text", "Open quiz");

		this.addNoteButton.addClass("ui-button");
		this.setIconAndTooltip(this.addNoteButton, "file-plus-2", "Add note");

		this.addFolderButton.addClass("ui-button");
		this.setIconAndTooltip(this.addFolderButton, "folder-plus", "Add folder");

		this.generateQuizButton.addClass("ui-button");
		this.setIconAndTooltip(this.generateQuizButton, "webhook", "Generate");

		this.clearButton.addEventListener("click", this.clearHandler);
		this.openQuizButton.addEventListener("click", this.openQuizHandler);
		this.addNoteButton.addEventListener("click", this.addNoteHandler);
		this.addFolderButton.addEventListener("click", this.addFolderHandler);
		this.generateQuizButton.addEventListener("click", this.generateQuizHandler);
	}

	private openNoteSelector(): void {
		const modal = new NoteAndFolderSelector(this.app, this.notePaths, this.modalEl);

		modal.setCallback(async (selectedItem: string): Promise<void> => {
			const selectedNote = this.app.vault.getAbstractFileByPath(selectedItem);
			if (selectedNote instanceof TFile) {
				this.notePaths.remove(selectedNote.path);
				this.openNoteSelector();
				const noteContents = await this.app.vault.cachedRead(selectedNote);
				this.selectedNotes.set(selectedNote.path, cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
				this.renderNote(selectedNote);
			}
		});

		modal.open();
	}

	private openFolderSelector(): void {
		const modal = new NoteAndFolderSelector(this.app, this.folderPaths, this.modalEl);

		modal.setCallback(async (selectedItem: string): Promise<void> => {
			const selectedFolder = this.app.vault.getAbstractFileByPath(selectedItem);
			if (selectedFolder instanceof TFolder) {
				this.folderPaths.remove(selectedFolder.path);
				this.openFolderSelector();

				let folderContents: string[] = [];
				const promises: Promise<void>[] = [];
				Vault.recurseChildren(selectedFolder, (file: TAbstractFile): void => {
					if (file instanceof TFile && file.extension === "md") {
						promises.push(
							(async (): Promise<void> => {
								const noteContents = await this.app.vault.cachedRead(file);
								folderContents.push(cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
							})()
						);
					}
				});

				await Promise.all(promises);
				this.selectedNotes.set(selectedFolder.path, folderContents.join(" "));
				this.renderFolder(selectedFolder);
			}
		});

		modal.open();
	}

	private renderNote(note: TFile): void {
		const tokens = this.renderNoteOrFolder(note, this.settings.showNotePath ? note.path : note.basename);
		this.toggleButtons(["clear", "generate"], false);
		this.updatePromptTokens(this.promptTokens + tokens);
	}

	private renderFolder(folder: TFolder): void {
		let folderName = this.settings.showFolderPath ? folder.path : folder.name;
		if (folder.path === "/") {
			folderName = this.app.vault.getName() + " (Vault)";
		}

		const tokens = this.renderNoteOrFolder(folder, folderName);
		this.toggleButtons(["clear", "generate"], false);
		this.updatePromptTokens(this.promptTokens + tokens);
	}

	private renderNoteOrFolder(item: TFile | TFolder, fileName: string): number {
		const itemContainer = this.notesContainer.createDiv("notes-container-element");
		itemContainer.textContent = fileName;

		const tokensElement = itemContainer.createDiv("note-tokens");
		const tokens = this.countNoteTokens(this.selectedNotes.get(item.path));
		tokensElement.textContent = tokens + " tokens";

		const viewContentsButton = itemContainer.createEl("button");
		this.setIconAndTooltip(viewContentsButton, "eye", "View contents");
		viewContentsButton.addEventListener("click", async (): Promise<void> => {
			if (item instanceof TFile) {
				new NoteViewerModal(this.app, item, this.modalEl).open();
			} else {
				new FolderViewerModal(this.app, this.modalEl, item).open();
			}
		});

		const removeButton = itemContainer.createEl("button");
		this.setIconAndTooltip(removeButton, "x", "Remove");
		removeButton.addEventListener("click", (): void => {
			this.removeNoteOrFolder(item, itemContainer);
			this.updatePromptTokens(this.promptTokens - tokens);

			if (this.selectedNotes.size === 0) {
				this.toggleButtons(["clear", "generate"], true);
			}
		});

		return tokens;
	}

	private removeNoteOrFolder(item: TFile | TFolder, element: HTMLDivElement): void {
		this.selectedNotes.delete(item.path);
		this.notesContainer.removeChild(element);
		item instanceof TFile ? this.notePaths.push(item.path) : this.folderPaths.push(item.path);
	}

	private toggleButtons(buttons: SelectorModalButtons[], disabled: boolean): void {
		const buttonMap: Record<SelectorModalButtons, HTMLButtonElement> = {
			clear: this.clearButton,
			quiz: this.openQuizButton,
			note: this.addNoteButton,
			folder: this.addFolderButton,
			generate: this.generateQuizButton,
		};
		buttons.forEach(button => buttonMap[button].disabled = disabled);
	}

	private updatePromptTokens(tokens: number): void {
		this.promptTokens = tokens;
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private setIconAndTooltip(element: HTMLElement, icon: string, tooltip: string): void {
		setIcon(element, icon);
		setTooltip(element, tooltip);
	}

	private validGenerationSettings(): boolean {
		return (this.settings.generateMultipleChoice || this.settings.generateTrueFalse
			|| this.settings.generateShortAnswer) && this.promptTokens > 0;
	}

	private countNoteTokens(noteContents: string | undefined): number {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	}
}
