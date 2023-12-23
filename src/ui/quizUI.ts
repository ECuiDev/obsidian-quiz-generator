import { App, FuzzySuggestModal, TFile } from "obsidian";

export default class QuizUI {
	private readonly app: App;
	private noteNames: string[];
	private allMarkdownFiles: TFile[];
	private selectedNotes: TFile[] = [];

	constructor(app: App) {
		this.app = app;
	}

	open() {
		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.showSearchBar();
	}

	close() {

	}

	private showSearchBar() {
		const modal = new CustomFuzzySuggestModal(this.app, this.noteNames);

		modal.setCallback((selectedItem: string) => {
			const selectedNote = this.getNoteByName(selectedItem);

			if (selectedNote) {
				this.selectedNotes.push(selectedNote);
				this.showSelectedNoteBox(selectedNote);
				modal.close();
				this.showSearchBar();
			}
		});

		document.addEventListener("keydown", (event) => this.handleKeyPress(event, modal));

		modal.open();
	}

	private showSelectedNoteBox(selectedNote: TFile) {
		const selectedNoteBox = document.createElement("div");
		selectedNoteBox.classList.add("selected-note-box");
		selectedNoteBox.textContent = selectedNote.basename;

		document.querySelector("#container")?.appendChild(selectedNoteBox);
	}

	private getNoteByName(noteName: string): TFile | null {
		return this.allMarkdownFiles.find(file => file.basename === noteName) || null;
	}

	private handleKeyPress(event: KeyboardEvent, modal: CustomFuzzySuggestModal) {
		if (event.code === "Escape") {
			this.terminateProcess(modal);
		}
	}

	private terminateProcess(modal: CustomFuzzySuggestModal) {
		if (modal) {
			console.log("Process terminated by user.");
			modal.close();
			document.removeEventListener("keydown", (event) => this.handleKeyPress(event, modal));
		}
	}

}

class CustomFuzzySuggestModal extends FuzzySuggestModal<string> {
	private callback: ((selectedItem: string, evt: MouseEvent | KeyboardEvent) => void) | null = null;
	private readonly noteNames: string[];

	constructor(app: App, noteNames: string[]) {
		super(app);
		this.noteNames = noteNames;
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

}
