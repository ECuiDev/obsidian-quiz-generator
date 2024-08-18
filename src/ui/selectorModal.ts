import { App, getFrontMatterInfo, Modal, Notice, Scope, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { Question, Quiz, QuizSettings, SelectorModalButton } from "../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../utils/typeGuards";
import { cleanUpNoteContents } from "../utils/markdownCleaner";
import GptGenerator from "../generators/gptGenerator";
import NoteAndFolderSelector from "./noteAndFolderSelector";
import NoteViewerModal from "./noteViewerModal";
import FolderViewerModal from "./folderViewerModal";
import QuizModalLogic from "./quizModalLogic";
import { countNoteTokens, setIconAndTooltip } from "../utils/helpers";

export default class SelectorModal extends Modal {
	private readonly settings: QuizSettings;
	private notePaths: string[];
	private folderPaths: string[];
	private selectedNotes: Map<string, string> = new Map<string, string>();
	private readonly itemContainer: HTMLDivElement;
	private readonly tokenContainer: HTMLSpanElement;
	private promptTokens: number = 0;
	private readonly buttonContainer: HTMLDivElement;
	private readonly clearButton: HTMLButtonElement;
	private readonly openQuizButton: HTMLButtonElement;
	private readonly addNoteButton: HTMLButtonElement;
	private readonly addFolderButton: HTMLButtonElement;
	private readonly generateQuizButton: HTMLButtonElement;
	private quiz: QuizModalLogic | undefined;

	constructor(app: App, settings: QuizSettings) {
		super(app);
		this.settings = settings;
		this.notePaths = this.app.vault.getMarkdownFiles().map((file: TFile) => file.path);
		this.folderPaths = this.app.vault.getAllLoadedFiles()
			.filter((abstractFile: TAbstractFile) => abstractFile instanceof TFolder)
			.map((folder: TFolder) => folder.path);
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());

		this.modalEl.addClass("modal-qg");
		this.contentEl.addClass("modal-content-qg");
		this.titleEl.addClass("modal-title-qg");
		this.titleEl.setText("Selected Notes");

		this.itemContainer = this.contentEl.createDiv("item-container-qg");
		this.tokenContainer = this.contentEl.createSpan("prompt-tokens-qg");
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
		this.buttonContainer = this.contentEl.createDiv("modal-button-container-qg");
		this.clearButton = this.buttonContainer.createEl("button", "modal-button-qg");
		this.openQuizButton = this.buttonContainer.createEl("button", "modal-button-qg");
		this.addNoteButton = this.buttonContainer.createEl("button", "modal-button-qg");
		this.addFolderButton = this.buttonContainer.createEl("button", "modal-button-qg");
		this.generateQuizButton = this.buttonContainer.createEl("button", "modal-button-qg");

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
		setIconAndTooltip(this.clearButton, "book-x", "Remove all");
		setIconAndTooltip(this.openQuizButton, "scroll-text", "Open quiz");
		setIconAndTooltip(this.addNoteButton, "file-plus-2", "Add note");
		setIconAndTooltip(this.addFolderButton, "folder-plus", "Add folder");
		setIconAndTooltip(this.generateQuizButton, "webhook", "Generate");

		const clearHandler = (): void => {
			this.toggleButtons(["clear", "generate"], true);
			this.selectedNotes.clear();
			this.itemContainer.empty();
			this.updatePromptTokens(0);
			this.notePaths = this.app.vault.getMarkdownFiles().map((file: TFile) => file.path);
			this.folderPaths = this.app.vault.getAllLoadedFiles()
				.filter((abstractFile: TAbstractFile) => abstractFile instanceof TFolder)
				.map((folder: TFolder) => folder.path);
		};
		const openQuizHandler = async (): Promise<void> => await this.quiz?.renderQuiz();
		const addNoteHandler = (): void => this.openNoteSelector();
		const addFolderHandler = (): void => this.openFolderSelector();
		const generateQuizHandler = async (): Promise<void> => {
			if (!this.validGenerationSettings()) {
				new Notice("Invalid generation settings or prompt contains 0 tokens");
				return;
			}

			this.toggleButtons(["generate"], true);
			const generator = new GptGenerator(this.settings);

			new Notice("Generating...");

			const generatedQuestions = await generator.generateQuestions([...this.selectedNotes.values()]);
			if (!generatedQuestions) {
				this.toggleButtons(["generate"], false);
				new Notice("Error: Generation returned nothing");
				return;
			}

			try {
				const quiz: Quiz = JSON.parse(generatedQuestions.replace(/\\+/g, "\\\\"));
				if (!Array.isArray(quiz.questions)) {
					new Notice("Error: Generation returned incorrect format");
				}

				const questions: Question[] = [];
				quiz.questions.forEach(question => {
					if (isTrueFalse(question)) {
						questions.push(question);
					} else if (isMultipleChoice(question)) {
						questions.push(question);
					} else if (isSelectAllThatApply(question)) {
						questions.push(question);
					} else if (isFillInTheBlank(question)) {
						questions.push(question);
					} else if (isMatching(question)) {
						questions.push(question);
					} else if (isShortOrLongAnswer(question)) {
						questions.push(question);
					} else {
						new Notice("A question was generated incorrectly");
					}
				});

				this.quiz = new QuizModalLogic(this.app, this.settings, questions, Array(questions.length).fill(false));
				await this.quiz.renderQuiz();
				this.toggleButtons(["quiz"], false);
			} catch (error) {
				new Notice((error as Error).message);
			} finally {
				this.toggleButtons(["generate"], false);
			}
		};

		this.clearButton.addEventListener("click", clearHandler);
		this.openQuizButton.addEventListener("click", openQuizHandler);
		this.addNoteButton.addEventListener("click", addNoteHandler);
		this.addFolderButton.addEventListener("click", addFolderHandler);
		this.generateQuizButton.addEventListener("click", generateQuizHandler);
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

				const folderContents: string[] = [];
				const promises: Promise<void>[] = [];
				Vault.recurseChildren(selectedFolder, (file: TAbstractFile): void => {
					if (file instanceof TFile && file.extension === "md" &&
						(this.settings.includeSubfolderNotes || file.parent?.path === selectedFolder.path)) {
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
		const itemContainer = this.itemContainer.createDiv("item-qg");
		itemContainer.textContent = fileName;

		const tokensElement = itemContainer.createDiv("item-tokens-qg");
		const tokens = countNoteTokens(this.selectedNotes.get(item.path)!);
		tokensElement.textContent = tokens + " tokens";

		const viewContentsButton = itemContainer.createEl("button", "item-button-qg");
		setIconAndTooltip(viewContentsButton, "eye", "View contents");
		viewContentsButton.addEventListener("click", async (): Promise<void> => {
			if (item instanceof TFile) {
				new NoteViewerModal(this.app, item, this.modalEl).open();
			} else {
				new FolderViewerModal(this.app, this.settings, this.modalEl, item).open();
			}
		});

		const removeButton = itemContainer.createEl("button", "item-button-qg");
		setIconAndTooltip(removeButton, "x", "Remove");
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
		this.itemContainer.removeChild(element);
		item instanceof TFile ? this.notePaths.push(item.path) : this.folderPaths.push(item.path);
	}

	private toggleButtons(buttons: SelectorModalButton[], disabled: boolean): void {
		const buttonMap: Record<SelectorModalButton, HTMLButtonElement> = {
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

	private validGenerationSettings(): boolean {
		return (this.settings.generateTrueFalse || this.settings.generateMultipleChoice ||
			this.settings.generateSelectAllThatApply || this.settings.generateFillInTheBlank ||
			this.settings.generateMatching || this.settings.generateShortAnswer || this.settings.generateLongAnswer) &&
			this.promptTokens > 0;
	}
}
