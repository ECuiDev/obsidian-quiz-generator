import {App, FuzzySuggestModal, Notice, TFile} from "obsidian";
import GptService from "../service/gptService";
import QuizGenerator from "../main";
import { cleanUpString } from "../utils/parser";

export default class QuizUI {
	private readonly app: App;
	private readonly plugin: QuizGenerator;
	private allMarkdownFiles: TFile[];
	private noteNames: string[];
	private selectedNotes: Map<string, string>;
	private searchContainer: HTMLDivElement;
	private elementsSection: HTMLDivElement;
	private tokenSection: HTMLSpanElement;
	private promptTokens: number = 0;
	private questionsAndAnswers: (ParsedMCQ | ParsedTFSA)[];
	private exitListener: () => void;
	private clearListener: () => void;
	private addListener: () => void;
	private generateListener: () => void;
	private gpt: GptService;

	constructor(app: App, plugin: QuizGenerator) {
		this.app = app;
		this.plugin = plugin;
	}

	open() {
		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.selectedNotes = new Map<string, string>();
		this.displaySearchUI();
		this.showSearchBar();
	}

	private close() {
		this.searchContainer.style.display = "none";
		this.searchContainer.innerHTML = "";
		this.elementsSection.style.display = "none";
		this.elementsSection.innerHTML = "";
	}

	private displaySearchUI() {
		this.displaySearchContainer();
		this.activateButtons();
		this.displaySearchButtons();
		this.displaySearchElements();
		this.displayTokens();
	}

	private async showSearchBar() {
		const modal = new SearchBar(this.app, this.noteNames);

		modal.setCallback(async (selectedItem: string) => {
			const selectedNote = this.getNoteByName(selectedItem);

			if (selectedNote) {
				const noteContents = cleanUpString(await this.app.vault.cachedRead(selectedNote));
				this.selectedNotes.set(selectedNote.basename, noteContents);
				console.log(this.selectedNotes.get(selectedNote.basename));
				console.log(JSON.stringify(this.selectedNotes.get(selectedNote.basename)));
				await this.displaySelectedNote(selectedNote.basename);
				modal.close();
				this.showSearchBar();
			}
		});

		modal.open();
	}

	private displaySearchContainer() {
		this.searchContainer = document.createElement("div");
		this.searchContainer.id = "selected-notes-container";
		document.body.appendChild(this.searchContainer);

		this.searchContainer.style.position = "fixed";
		this.searchContainer.style.top = "50%";
		this.searchContainer.style.left = "50%";
		this.searchContainer.style.transform = "translate(-50%, -50%)";
		this.searchContainer.style.zIndex = "1";
		this.searchContainer.style.width = "800px";
		this.searchContainer.style.height = "80vh";
		this.searchContainer.style.overflow = "hidden";
		this.searchContainer.style.backgroundColor = "#343434";
		this.searchContainer.style.padding = "10px";
		this.searchContainer.style.border = "1px solid #ccc";
		this.searchContainer.style.borderRadius = "5px";
	}

	private displaySearchButtons() {
		const buttonSectionLeft = document.createElement("div");
		buttonSectionLeft.style.position = "absolute";
		buttonSectionLeft.style.bottom = "10px";
		buttonSectionLeft.style.left = "10px";
		buttonSectionLeft.style.display = "flex";

		const exit = document.createElement("button");
		exit.textContent = "Exit";
		exit.style.backgroundColor = "#4CAF50";
		exit.style.color = "white";
		exit.style.padding = "10px 20px";
		exit.style.marginRight = "10px";

		const clear = document.createElement("button");
		clear.textContent = "Clear All";
		clear.style.backgroundColor = "#008CBA";
		clear.style.color = "white";
		clear.style.padding = "10px 20px";
		clear.style.marginRight = "10px";

		buttonSectionLeft.appendChild(exit);
		buttonSectionLeft.appendChild(clear);
		this.searchContainer.appendChild(buttonSectionLeft);

		const buttonSectionRight = document.createElement("div");
		buttonSectionRight.style.position = "absolute";
		buttonSectionRight.style.bottom = "10px";
		buttonSectionRight.style.right = "10px";
		buttonSectionRight.style.display = "flex";

		const add = document.createElement("button");
		add.textContent = "Add";
		add.style.backgroundColor = "#ff6600";
		add.style.color = "white";
		add.style.padding = "10px 20px";
		add.style.marginLeft = "10px";

		const generate = document.createElement("button");
		generate.id = "generate";
		generate.textContent = "Generate";
		generate.style.backgroundColor = "#800080";
		generate.style.color = "white";
		generate.style.padding = "10px 20px";
		generate.style.marginLeft = "10px";

		buttonSectionRight.appendChild(add);
		buttonSectionRight.appendChild(generate);
		this.searchContainer.appendChild(buttonSectionRight);

		exit.addEventListener("click", this.exitListener);
		clear.addEventListener("click", this.clearListener);
		add.addEventListener("click", this.addListener);
		generate.addEventListener("click", this.generateListener);
	}

	private displaySearchElements() {
		this.elementsSection = document.createElement("div");
		this.elementsSection.style.overflowY = "auto"; // Make this section scrollable
		this.elementsSection.style.height = "calc(100% - 40px)"; // Adjust the height as needed
		this.searchContainer.appendChild(this.elementsSection);
	}

	private displayTokens() {
		this.tokenSection = document.createElement("span");
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;

		this.tokenSection.style.position = "absolute";
		this.tokenSection.style.left = "50%";
		this.tokenSection.style.bottom = "10px";
		this.tokenSection.style.transform = "translateX(-50%)";

		this.searchContainer.appendChild(this.tokenSection);
	}

	private activateButtons() {
		this.exitListener = async () => this.close();

		this.clearListener = async () => {
			this.selectedNotes.clear();
			this.elementsSection.innerHTML = "";
			this.promptTokens = 0;
			this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
		}

		this.addListener = async () => await this.showSearchBar();

		this.generateListener = async () => {
			if (this.plugin.settings.generateMultipleChoice || this.plugin.settings.generateTrueFalse
				|| this.plugin.settings.generateShortAnswer) {
				this.gpt = new GptService(this.plugin);
				await this.gpt.generateQuestions(await this.generateQuestions());
			} else {
				new Notice("Generation cancelled because all question types are set to false.")
			}
		}
	}

	private async displaySelectedNote(selectedNote: string) {
		const selectedNoteBox = document.createElement("div");
		const noteTokens = await this.countNoteTokens(this.selectedNotes.get(selectedNote));

		selectedNoteBox.textContent = selectedNote;
		selectedNoteBox.style.display = "flex";
		selectedNoteBox.style.flexDirection = "row";
		selectedNoteBox.style.backgroundColor = "#343434"; // Background color
		selectedNoteBox.style.padding = "10px"; // Padding
		selectedNoteBox.style.marginBottom = "5px"; // Adjust margin as needed
		selectedNoteBox.style.borderRadius = "5px"; // Rounded corners
		selectedNoteBox.style.border = "1px solid #ddd"; // Border

		const noteTokensElement = document.createElement("div");
		noteTokensElement.textContent = noteTokens + " tokens";
		noteTokensElement.style.marginLeft = "auto";

		selectedNoteBox.appendChild(noteTokensElement);

		this.elementsSection.appendChild(selectedNoteBox);

		this.promptTokens += noteTokens;
		this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens;
	}

	private async generateQuestions() {
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

}

class SearchBar extends FuzzySuggestModal<string> {
	private callback: ((selectedItem: string, evt: MouseEvent | KeyboardEvent) => void) | null = null;
	private readonly noteNames: string[];
	private keydownHandler: (event: KeyboardEvent) => void;

	constructor(app: App, noteNames: string[]) {
		super(app);
		this.noteNames = noteNames;
	}

	onOpen() {
		super.onOpen();
		this.keydownHandler = (event: KeyboardEvent) => this.handleKeyPress(event);
		document.addEventListener("keydown", this.keydownHandler);

		this.modalEl.style.top = "20%";
		this.modalEl.style.left = "30%";
	}

	onClose() {
		document.removeEventListener("keydown", this.keydownHandler);
		super.onClose();
	}

	setCallback(callback: (selectedItem: string, evt: MouseEvent | KeyboardEvent) => void): void {
		this.callback = callback;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		if (this.callback) {
			this.callback(item, evt);
		}
	}

	getItemText(item: string): string {
		return item;
	}

	getItems(): string[] {
		return this.noteNames;
	}

	private handleKeyPress(event: KeyboardEvent) {
		if (event.code === "Escape") {
			this.close();
		}
	}

}

interface ParsedMCQ {
	question: string;
	choice1: string;
	choice2: string;
	choice3: string;
	choice4: string;
	answer: string;
	type: "MC";
}

interface ParsedTFSA {
	question: string;
	answer: string;
	type: "TF" | "SA";
}
