import { App, FuzzySuggestModal } from "obsidian";

export default class NoteAndFolderSelector extends FuzzySuggestModal<string> {
	private callback: ((selectedItem: string, evt: MouseEvent | KeyboardEvent) => void) | undefined; // evt unnecessary?
	private readonly paths: string[];
	private readonly selectorModal: HTMLElement;

	constructor(app: App, paths: string[], selectorModal: HTMLElement) {
		super(app);
		this.paths = paths;
		this.selectorModal = selectorModal;

		this.onChooseItem = this.onChooseItem.bind(this); // unnecessary?
	}

	public onOpen(): void {
		super.onOpen();
		this.containerEl.children[0].addClass("remove-opacity-qg");
		this.modalEl.addClass("move-right-qg", "suggest-modal-content-qg");
		this.selectorModal.addClass("move-left-qg");
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal.removeClass("move-left-qg");
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
