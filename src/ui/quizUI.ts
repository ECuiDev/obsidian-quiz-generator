import { App, FuzzySuggestModal, TFile } from "obsidian";

export default class QuizUI {
	private readonly app: App;
	private noteNames: string[];
	private allMarkdownFiles: TFile[];
	private selectedNotes: TFile[] = [];
	private container: HTMLDivElement | null = null;

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
		const modal = new SearchBar(this.app, this.noteNames);

		modal.setCallback((selectedItem: string) => {
			const selectedNote = this.getNoteByName(selectedItem);

			if (selectedNote) {
				this.selectedNotes.push(selectedNote);
				this.displaySelectedNotes();
				modal.close();
				this.showSearchBar();
			}
		});

		document.addEventListener("keydown", (event) => this.handleKeyPress(event, modal));

		modal.open();
	}

	private displaySelectedNotes() {
		if (!this.container) {
			this.container = document.createElement("div");
			this.container.id = "selected-notes-container";
			document.body.appendChild(this.container);
		}

		this.container.innerHTML = "";

		this.selectedNotes.forEach((selectedNote) => {
			const selectedNoteBox = document.createElement("div");
			selectedNoteBox.classList.add("selected-note-box");
			selectedNoteBox.textContent = selectedNote.basename;
			this.container?.appendChild(selectedNoteBox);
		});

		if (this.container) {
			this.container.style.position = "fixed";
			this.container.style.top = "20px"; // Adjust top position as needed
			this.container.style.left = "20px"; // Adjust left position as needed
			this.container.style.zIndex = "1000"; // Ensure it's above other elements
			this.container.style.width = "300px"; // Set a fixed width
			this.container.style.maxHeight = "400px"; // Set a maximum height
			this.container.style.overflowY = "auto"; // Add a scrollbar if content exceeds the maximum height
			this.container.style.backgroundColor = "#ebecf0"; // Trello-like background color
			this.container.style.padding = "10px"; // Padding
			this.container.style.border = "1px solid #ccc"; // Border for visibility
			this.container.style.borderRadius = "5px"; // Rounded corners
		}

		const noteBoxes = document.querySelectorAll(".selected-note-box");
		noteBoxes.forEach((noteBox) => {
			const boxElement = noteBox as HTMLElement; // Explicitly cast to HTMLElement
			if (boxElement) {
				boxElement.style.backgroundColor = "#343434"; // Background color
				boxElement.style.padding = "10px"; // Padding
				boxElement.style.marginBottom = "5px"; // Adjust margin as needed
				boxElement.style.borderRadius = "5px"; // Rounded corners
				boxElement.style.border = "1px solid #ddd"; // Border
			}
		});
	}

	private getNoteByName(noteName: string): TFile | null {
		return this.allMarkdownFiles.find(file => file.basename === noteName) || null;
	}

	private getRemainingNoteNames(): string[] {
		return this.allMarkdownFiles
			.filter((file) => !this.selectedNotes.some((selectedNote) => selectedNote.basename === file.basename))
			.map((file) => file.basename);
	}

	private handleKeyPress(event: KeyboardEvent, modal: SearchBar) {
		if (event.code === "Escape") {
			this.terminateProcess(modal);
		}
	}

	private terminateProcess(modal: SearchBar) {
		if (modal) {
			console.log("Process terminated by user.");
			modal.close();
			document.removeEventListener("keydown", (event) => this.handleKeyPress(event, modal));
		}
	}

}

class SearchBar extends FuzzySuggestModal<string> {
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
