import { App, MarkdownRenderer, Modal, TFile } from "obsidian";
import QuizGenerator from "../main";

export default class NoteViewerModal extends Modal {
	private readonly plugin: QuizGenerator;
	private readonly note: TFile;

	constructor(app: App, plugin: QuizGenerator, note: TFile) {
		super(app);
		this.plugin = plugin;
		this.note = note;

		this.modalEl.addClass("modal-el-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText(note.basename);
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		await MarkdownRenderer.render(this.app, await this.app.vault.cachedRead(this.note), this.contentEl, "", this.plugin);
	}

	public onClose(): void {
		super.onClose();
	}
}
