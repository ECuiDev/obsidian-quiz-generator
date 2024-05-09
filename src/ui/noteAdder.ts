import { App, FuzzySuggestModal } from "obsidian";
// Refactor into a single file/class with folderAdder?
export default class NoteAdder extends FuzzySuggestModal<string> {
	private callback: ((selectedItem: string, evt: MouseEvent | KeyboardEvent) => void) | null = null;
	private readonly notePaths: string[];
	private selectorContainer: HTMLElement;

	constructor(app: App, notePaths: string[], selectorContainer: HTMLElement) {
		super(app);
		this.notePaths = notePaths;
		this.selectorContainer = selectorContainer;

		this.onChooseItem = this.onChooseItem.bind(this);
	}

	public onOpen(): void {
		super.onOpen();
		this.containerEl.firstElementChild?.addClass("remove-opacity");
		this.selectorContainer.addClass("move-left");
		this.containerEl.children[1].addClass("move-right", "adder-modal");
	}

	public onClose(): void {
		super.onClose();
		this.selectorContainer.removeClass("move-left");
	}

	public setCallback(callback: (selectedItem: string, evt: MouseEvent | KeyboardEvent) => void): void {
		this.callback = callback;
	}

	public onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		if (this.callback) {
			this.callback(item, evt);
		}
	}

	public getItemText(item: string): string {
		return item;
	}

	public getItems(): string[] {
		return this.notePaths;
	}

}
