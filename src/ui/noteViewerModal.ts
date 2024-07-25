import { App, Component, MarkdownRenderer, Modal, Scope, TFile } from "obsidian";

export default class NoteViewerModal extends Modal {
	private readonly note: TFile;
	private readonly selectorModal: HTMLElement | undefined;
	private readonly component: Component;

	constructor(app: App, note: TFile, selectorModal?: HTMLElement) {
		super(app);
		this.note = note;
		this.selectorModal = selectorModal;
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
		this.component = new Component();
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		this.modalEl.addClass("modal-el-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText(this.note.basename);

		this.containerEl.children[0].addClass("remove-opacity");
		this.containerEl.children[1].addClass("move-right");
		this.selectorModal?.addClass("move-left");

		await MarkdownRenderer.render(this.app, await this.app.vault.cachedRead(this.note), this.contentEl, "", this.component);
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal?.removeClass("move-left");
	}
}
