import { App, MarkdownRenderer, Modal, Scope, TFile } from "obsidian";
import QuizGenerator from "../main";

export default class NoteViewerModal extends Modal {
	private readonly plugin: QuizGenerator;
	private readonly note: TFile;
	// private selectorModal: HTMLElement;

	constructor(app: App, plugin: QuizGenerator, note: TFile) {
		super(app);
		this.plugin = plugin;
		// this.selectorModal = selectorModal;
		this.note = note;
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		this.modalEl.addClass("modal-el-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText(this.note.basename);

		// this.containerEl.firstElementChild?.addClass("remove-opacity");
		// this.selectorModal.addClass("move-left");
		// this.containerEl.children[1].addClass("move-right");

		// if (this.containerEl.firstElementChild){
		// 	this.containerEl.removeChild(this.containerEl.firstElementChild);
		// }

		await MarkdownRenderer.render(this.app, await this.app.vault.cachedRead(this.note), this.contentEl, "", this.plugin);
	}

	public onClose(): void {
		super.onClose();
		// this.selectorModal.removeClass("move-left");
	}
}
