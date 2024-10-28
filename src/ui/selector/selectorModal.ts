import { App, getFrontMatterInfo, Modal, Notice, Scope, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import { QuizSettings } from "../../settings/config";
import { Question, Quiz } from "../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../../utils/typeGuards";
import NoteAndFolderSelector from "./noteAndFolderSelector";
import NoteViewerModal from "./noteViewerModal";
import FolderViewerModal from "./folderViewerModal";
import GeneratorFactory from "../../generators/generatorFactory";
import QuizModalLogic from "../quiz/quizModalLogic";
import { cleanUpNoteContents } from "../../utils/markdownCleaner";
import { countNoteTokens, setIconAndTooltip } from "../../utils/helpers";
import { Provider } from "../../generators/providers";

const enum SelectorModalButton {
	CLEAR,
	QUIZ,
	NOTE,
	FOLDER,
	GENERATE,
}

export default class SelectorModal extends Modal {
	private readonly settings: QuizSettings;
	private notePaths: string[];
	private folderPaths: string[];
	private readonly selectedNotes: Map<string, string> = new Map<string, string>();
	private readonly selectedNoteFiles: Map<string, TFile[]> = new Map<string, TFile[]>();
	private readonly itemContainer: HTMLDivElement;
	private readonly tokenContainer: HTMLSpanElement;
	private promptTokens: number = 0;
	private readonly buttonMap: Record<SelectorModalButton, HTMLButtonElement>;
	private quiz: QuizModalLogic | undefined;

	constructor(app: App, settings: QuizSettings) {
		super(app);
		this.settings = settings;
		this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
		this.folderPaths = this.app.vault.getAllFolders(true).map(folder => folder.path);
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());

		this.modalEl.addClass("modal-qg");
		this.contentEl.addClass("modal-content-qg");
		this.titleEl.addClass("modal-title-qg");
		this.titleEl.setText("Selected Notes");

		this.itemContainer = this.contentEl.createDiv("item-container-qg");
		this.tokenContainer = this.contentEl.createSpan("prompt-tokens-qg");
		this.tokenContainer.textContent = "Prompt tokens: " + this.promptTokens;
		this.buttonMap = this.activateButtons();
	}

	public onOpen(): void {
		super.onOpen();
		this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.QUIZ, SelectorModalButton.GENERATE], true);
	}

	private activateButtons(): Record<SelectorModalButton, HTMLButtonElement> {
		const buttonContainer = this.contentEl.createDiv("modal-button-container-qg");
		const clearButton = buttonContainer.createEl("button", "modal-button-qg");
		const openQuizButton = buttonContainer.createEl("button", "modal-button-qg");
		const addNoteButton = buttonContainer.createEl("button", "modal-button-qg");
		const addFolderButton = buttonContainer.createEl("button", "modal-button-qg");
		const generateQuizButton = buttonContainer.createEl("button", "modal-button-qg");
		const buttonMap: Record<SelectorModalButton, HTMLButtonElement> = {
			[SelectorModalButton.CLEAR]: clearButton,
			[SelectorModalButton.QUIZ]: openQuizButton,
			[SelectorModalButton.NOTE]: addNoteButton,
			[SelectorModalButton.FOLDER]: addFolderButton,
			[SelectorModalButton.GENERATE]: generateQuizButton,
		};

		setIconAndTooltip(clearButton, "book-x", "Remove all");
		setIconAndTooltip(openQuizButton, "scroll-text", "Open quiz");
		setIconAndTooltip(addNoteButton, "file-plus-2", "Add note");
		setIconAndTooltip(addFolderButton, "folder-plus", "Add folder");
		setIconAndTooltip(generateQuizButton, "webhook", "Generate");

		const clearHandler = (): void => {
			this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], true);
			this.selectedNotes.clear();
			this.selectedNoteFiles.clear();
			this.itemContainer.empty();
			this.updatePromptTokens(0);
			this.notePaths = this.app.vault.getMarkdownFiles().map(file => file.path);
			this.folderPaths = this.app.vault.getAllFolders(true).map(folder => folder.path);
		};
		const openQuizHandler = async (): Promise<void> => await this.quiz?.renderQuiz();
		const addNoteHandler = (): void => this.openNoteSelector();
		const addFolderHandler = (): void => this.openFolderSelector();
		const generateQuizHandler = async (): Promise<void> => {
			if (!this.validGenerationSettings()) {
				new Notice("Invalid generation settings or prompt contains 0 tokens");
				return;
			}

			this.toggleButtons([SelectorModalButton.GENERATE], true);

			try {
				new Notice("Generating...");
				const generator = GeneratorFactory.createInstance(this.settings);
				const generatedQuestions = await generator.generateQuiz([...this.selectedNotes.values()]);
				if (generatedQuestions === null) {
					this.toggleButtons([SelectorModalButton.GENERATE], false);
					new Notice("Error: Generation returned nothing");
					return;
				}

				const quiz: Quiz = JSON.parse(generatedQuestions.replace(/\\+/g, "\\\\"));
				const questions: Question[] = [];
				quiz.questions.forEach(question => {
					if (isTrueFalse(question)) {
						questions.push(question);
					} else if (isMultipleChoice(question)) {
						questions.push(question);
					} else if (isSelectAllThatApply(question)) {
						questions.push(question);
					} else if (isFillInTheBlank(question)) {
						const normalizeBlanks = (str: string): string => {
							return this.settings.provider !== Provider.COHERE ? str : str.replace(/_{2,}|\$_{2,}\$/g, "`____`");
						};
						questions.push({ question: normalizeBlanks(question.question), answer: question.answer });
					} else if (isMatching(question)) {
						questions.push(question);
					} else if (isShortOrLongAnswer(question)) {
						questions.push(question);
					} else {
						new Notice("A question was generated incorrectly");
					}
				});

				this.quiz = new QuizModalLogic(this.app, this.settings, questions, [...this.selectedNoteFiles.values()].flat());
				await this.quiz.renderQuiz();
				this.toggleButtons([SelectorModalButton.QUIZ], false);
			} catch (error) {
				new Notice((error as Error).message, 0);
			} finally {
				this.toggleButtons([SelectorModalButton.GENERATE], false);
			}
		};

		clearButton.addEventListener("click", clearHandler);
		openQuizButton.addEventListener("click", openQuizHandler);
		addNoteButton.addEventListener("click", addNoteHandler);
		addFolderButton.addEventListener("click", addFolderHandler);
		generateQuizButton.addEventListener("click", generateQuizHandler);

		return buttonMap;
	}

	private openNoteSelector(): void {
		const selector = new NoteAndFolderSelector(this.app, this.notePaths, this.modalEl, this.addNote.bind(this));
		selector.open();
	}

	private openFolderSelector(): void {
		const selector = new NoteAndFolderSelector(this.app, this.folderPaths, this.modalEl, this.addFolder.bind(this));
		selector.open();
	}

	private async addNote(note: string): Promise<void> {
		const selectedNote = this.app.vault.getAbstractFileByPath(note);
		if (selectedNote instanceof TFile) {
			this.notePaths = this.notePaths.filter(notePath => notePath !== selectedNote.path);
			this.openNoteSelector();
			const noteContents = await this.app.vault.cachedRead(selectedNote);
			this.selectedNotes.set(selectedNote.path, cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
			this.selectedNoteFiles.set(selectedNote.path, [selectedNote]);
			this.renderNote(selectedNote);
		}
	}

	private async addFolder(folder: string): Promise<void> {
		const selectedFolder = this.app.vault.getAbstractFileByPath(folder);
		if (selectedFolder instanceof TFolder) {
			this.folderPaths = this.folderPaths.filter(folderPath => folderPath !== selectedFolder.path);
			this.openFolderSelector();

			const folderContents: string[] = [];
			const notes: TFile[] = [];
			const promises: Promise<void>[] = [];
			Vault.recurseChildren(selectedFolder, (file: TAbstractFile): void => {
				if (file instanceof TFile && file.extension === "md" &&
					(this.settings.includeSubfolderNotes || file.parent?.path === selectedFolder.path)) {
					promises.push(
						(async (): Promise<void> => {
							const noteContents = await this.app.vault.cachedRead(file);
							folderContents.push(cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
							notes.push(file);
						})()
					);
				}
			});

			await Promise.all(promises);
			this.selectedNotes.set(selectedFolder.path, folderContents.join(" "));
			this.selectedNoteFiles.set(selectedFolder.path, notes);
			this.renderFolder(selectedFolder);
		}
	}

	private renderNote(note: TFile): void {
		const tokens = this.renderNoteOrFolder(note, this.settings.showNotePath ? note.path : note.basename);
		this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], false);
		this.updatePromptTokens(this.promptTokens + tokens);
	}

	private renderFolder(folder: TFolder): void {
		let folderName = this.settings.showFolderPath ? folder.path : folder.name;
		if (folder.path === "/") {
			folderName = this.app.vault.getName() + " (Vault)";
		}

		const tokens = this.renderNoteOrFolder(folder, folderName);
		this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], false);
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
				this.toggleButtons([SelectorModalButton.CLEAR, SelectorModalButton.GENERATE], true);
			}
		});

		return tokens;
	}

	private removeNoteOrFolder(item: TFile | TFolder, element: HTMLDivElement): void {
		this.selectedNotes.delete(item.path);
		this.selectedNoteFiles.delete(item.path);
		this.itemContainer.removeChild(element);
		item instanceof TFile ? this.notePaths.push(item.path) : this.folderPaths.push(item.path);
	}

	private toggleButtons(buttons: SelectorModalButton[], disabled: boolean): void {
		buttons.forEach(button => this.buttonMap[button].disabled = disabled);
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
