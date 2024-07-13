import {
	App,
	getFrontMatterInfo,
	Modal,
	Scope,
	setIcon,
	setTooltip,
	TAbstractFile,
	TFile,
	TFolder,
	Vault
} from "obsidian";
import NoteViewerModal from "./noteViewerModal";
import { cleanUpNoteContents } from "../utils/parser";

export default class FolderViewerModal extends Modal {
	private selectorModal: HTMLElement;
	private readonly folder: TFolder;
	private notesContainer: HTMLDivElement;

	constructor(app: App, selectorModal: HTMLElement, folder: TFolder) {
		super(app);
		this.selectorModal = selectorModal;
		this.folder = folder;
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
		this.notesContainer = this.contentEl.createDiv("notes-container");
	}

	public async onOpen(): Promise<void> {
		super.onOpen();
		this.modalEl.addClass("modal-el-container");
		this.contentEl.addClass("modal-content-container");
		this.titleEl.addClass("title-style");
		this.titleEl.setText(this.folder.name);

		this.containerEl.children[0].addClass("remove-opacity");
		this.containerEl.children[1].addClass("move-right");
		this.selectorModal.addClass("move-left");

		const promises: Promise<void>[] = [];
		Vault.recurseChildren(this.folder, (file: TAbstractFile): void => {
			if (file instanceof TFile && file.extension === "md") {
				promises.push(
					(async (): Promise<void> => {
						await this.renderNote(file);
					})()
				);
			}
		});

		await Promise.all(promises);
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal.removeClass("move-left");
	}

	private async renderNote(item: TFile): Promise<void> {
		const itemContainer = this.notesContainer.createDiv("notes-container-element");
		itemContainer.textContent = item.basename;

		const noteContents = await this.app.vault.cachedRead(item);
		const tokensElement = itemContainer.createDiv("note-tokens");
		const tokens = this.countNoteTokens(cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
		tokensElement.textContent = tokens + " tokens";

		const viewContentsButton = itemContainer.createEl("button");
		this.setIconAndTooltip(viewContentsButton, "eye", "View contents");
		viewContentsButton.addEventListener("click", async (): Promise<void> => {
			new NoteViewerModal(this.app, item).open();
		});
	}

	private setIconAndTooltip(element: HTMLElement, icon: string, tooltip: string): void {
		setIcon(element, icon);
		setTooltip(element, tooltip);
	}

	private countNoteTokens(noteContents: string): number {
		return Math.round(noteContents.length / 4);
	}
}
