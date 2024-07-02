import { App, FuzzySuggestModal, Scope } from "obsidian";

export default class NoteAndFolderSelector extends FuzzySuggestModal<string> {
	private callback: ((selectedItem: string, evt: MouseEvent | KeyboardEvent) => void) | undefined; // evt unnecessary?
	private readonly paths: string[];
	private selectorModal: HTMLElement;

	constructor(app: App, paths: string[], selectorModal: HTMLElement) {
		super(app);
		this.paths = paths;
		this.selectorModal = selectorModal;

		this.onChooseItem = this.onChooseItem.bind(this); // unnecessary?
		this.scope = new Scope(this.app.scope);
	}

	public onOpen(): void {
		super.onOpen();
		this.containerEl.firstElementChild?.addClass("remove-opacity");
		this.selectorModal.addClass("move-left");
		this.containerEl.children[1].addClass("move-right", "adder-modal");
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal.removeClass("move-left");
	}

	public getItems(): string[] {
		return this.paths;
	}

	public getItemText(item: string): string {
		return item;
	}

	public onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		if (this.callback) {
			this.callback(item, evt);
		}
	}

	public setCallback(callback: (selectedItem: string, evt: MouseEvent | KeyboardEvent) => void): void {
		this.callback = callback;
	}

}
