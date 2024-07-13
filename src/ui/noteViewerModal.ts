import { App, Component, MarkdownRenderer, Modal, Scope, TFile } from "obsidian";

export default class NoteViewerModal extends Modal {
	private selectorModal: HTMLElement;
	private readonly note: TFile;
	private readonly component: Component;

	constructor(app: App, selectorModal: HTMLElement, note: TFile) {
		super(app);
		this.selectorModal = selectorModal;
		this.note = note;
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
		this.component = new Component();
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		this.modalEl.addClass("modal-el-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText(this.note.basename);

		this.containerEl.firstElementChild?.addClass("remove-opacity");
		this.selectorModal.addClass("move-left");
		this.containerEl.children[1].addClass("move-right");

		await MarkdownRenderer.render(this.app, await this.app.vault.cachedRead(this.note), this.contentEl, "", this.component);
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal.removeClass("move-left");
	}
}
