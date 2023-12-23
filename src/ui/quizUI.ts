import { App, FuzzySuggestModal, TFile } from "obsidian";

export default class QuizUI {
	private readonly app: App;
	private noteNames: string[];
	private allMarkdownFiles: TFile[];
	private selectedNotes: TFile[] = [];
	private container: HTMLDivElement | null = null;
	private elementsSection: HTMLDivElement | null = null;

	constructor(app: App) {
		this.app = app;
	}

	open() {
		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.displayUI();
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
				this.displaySelectedNote(selectedNote);
				modal.close();
				this.showSearchBar();
			}
		});

		document.addEventListener("keydown", (event) => this.handleKeyPress(event, modal));

		modal.open();
	}

	private displayUI() {
		if (!this.container) {
			this.container = document.createElement("div");
			this.container.id = "selected-notes-container";
			document.body.appendChild(this.container);
		}

		this.container.innerHTML = "";

		if (this.container) {
			this.container.style.position = "fixed";
			this.container.style.top = "50%";
			this.container.style.left = "50%";
			this.container.style.transform = "translate(-50%, -50%)";
			this.container.style.zIndex = "1";
			this.container.style.width = "800px";
			this.container.style.height = "80vh";
			this.container.style.overflow = "hidden";
			this.container.style.backgroundColor = "#343434";
			this.container.style.padding = "10px";
			this.container.style.border = "1px solid #ccc";
			this.container.style.borderRadius = "5px";

			const buttonSection = document.createElement("div");
			buttonSection.style.position = "absolute";
			buttonSection.style.bottom = "0";
			buttonSection.style.width = "100%";

			const button1 = document.createElement("button");
			button1.textContent = "Button 1";
			buttonSection.appendChild(button1);
			const button2 = document.createElement("button");
			button2.textContent = "Button 2";
			buttonSection.appendChild(button2);

			this.container?.appendChild(buttonSection);

			this.elementsSection = document.createElement("div");
			this.elementsSection.style.overflowY = "auto"; // Make this section scrollable
			this.elementsSection.style.height = "calc(100% - 40px)"; // Adjust the height as needed

			this.container.appendChild(this.elementsSection);
		}
	}

	private displaySelectedNote(selectedNote: TFile) {
		const selectedNoteBox = document.createElement("div");
		selectedNoteBox.textContent = selectedNote.basename;
		this.elementsSection?.appendChild(selectedNoteBox);

		const boxElement = selectedNoteBox as HTMLElement; // Explicitly cast to HTMLElement
		boxElement.style.backgroundColor = "#343434"; // Background color
		boxElement.style.padding = "10px"; // Padding
		boxElement.style.marginBottom = "5px"; // Adjust margin as needed
		boxElement.style.borderRadius = "5px"; // Rounded corners
		boxElement.style.border = "1px solid #ddd"; // Border
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

	onOpen() {
		super.onOpen();
		this.modalEl.style.top = "20%";
		this.modalEl.style.left = "30%";
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
