import { App, FuzzySuggestModal, TFile } from "obsidian";

export default class QuizUI {
	private readonly app: App;
	private noteNames: string[];
	private allMarkdownFiles: TFile[];
	private selectedNotes: TFile[] = [];
	private searchContainer: HTMLDivElement | null = null;
	private elementsSection: HTMLDivElement | null = null;

	constructor(app: App) {
		this.app = app;
	}

	open() {
		this.allMarkdownFiles = this.app.vault.getMarkdownFiles();
		this.noteNames = this.allMarkdownFiles.map(file => file.basename);
		this.displaySearchUI();
		this.showSearchBar();
	}

	close() {

	}

	private displaySearchUI() {
		this.displaySearchContainer();
		this.displaySearchButtons();
		this.displaySearchElements();
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

		modal.open();
	}

	private displaySearchContainer() {
		this.searchContainer = document.createElement("div");
		this.searchContainer.id = "selected-notes-container";
		document.body.appendChild(this.searchContainer);

		this.searchContainer.innerHTML = "";

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
		this.searchContainer?.appendChild(buttonSectionLeft);

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
		generate.textContent = "Generate";
		generate.style.backgroundColor = "#800080";
		generate.style.color = "white";
		generate.style.padding = "10px 20px";
		generate.style.marginLeft = "10px";

		buttonSectionRight.appendChild(add);
		buttonSectionRight.appendChild(generate);
		this.searchContainer?.appendChild(buttonSectionRight);
	}

	private displaySearchElements() {
		this.elementsSection = document.createElement("div");
		this.elementsSection.style.overflowY = "auto"; // Make this section scrollable
		this.elementsSection.style.height = "calc(100% - 40px)"; // Adjust the height as needed
		this.searchContainer?.appendChild(this.elementsSection);
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
			this.terminateProcess();
		}
	}

	private terminateProcess() {
		document.removeEventListener("keydown", this.keydownHandler);
		this.close();
	}

}
