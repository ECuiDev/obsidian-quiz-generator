import { App, getFrontMatterInfo, Modal, Scope, TAbstractFile, TFile, TFolder, Vault } from "obsidian";
import NoteViewerModal from "./noteViewerModal";
import { cleanUpNoteContents } from "../../utils/markdownCleaner";
import { QuizSettings } from "../../settings/config";
import { countNoteTokens, setIconAndTooltip } from "../../utils/helpers";

export default class FolderViewerModal extends Modal {
	private readonly settings: QuizSettings;
	private readonly selectorModal: HTMLElement;
	private readonly folder: TFolder;
	private readonly notesContainer: HTMLDivElement;

	constructor(app: App, settings: QuizSettings, selectorModal: HTMLElement, folder: TFolder) {
		super(app);
		this.settings = settings;
		this.selectorModal = selectorModal;
		this.folder = folder;
		this.scope = new Scope(this.app.scope);
		this.scope.register([], "Escape", () => this.close());
		this.notesContainer = this.contentEl.createDiv("item-container-qg");
	}

	public onOpen(): void {
		super.onOpen();
		this.modalEl.addClass("modal-qg");
		this.contentEl.addClass("modal-content-qg");
		this.titleEl.addClass("modal-title-qg");
		this.titleEl.setText(this.folder.name);

		this.containerEl.children[0].addClass("remove-opacity-qg");
		this.modalEl.addClass("move-right-qg");
		this.selectorModal.addClass("move-left-qg");

		Vault.recurseChildren(this.folder, async (file: TAbstractFile): Promise<void> => {
			if (file instanceof TFile && file.extension === "md" &&
				(this.settings.includeSubfolderNotes || file.parent?.path === this.folder.path)) {
				await this.renderNote(file);
			}
		});
	}

	public onClose(): void {
		super.onClose();
		this.selectorModal.removeClass("move-left-qg");
	}

	private async renderNote(item: TFile): Promise<void> {
		const itemContainer = this.notesContainer.createDiv("item-qg");
		itemContainer.textContent = item.basename;

		const noteContents = await this.app.vault.cachedRead(item);
		const tokensElement = itemContainer.createDiv("item-tokens-qg");
		const tokens = countNoteTokens(cleanUpNoteContents(noteContents, getFrontMatterInfo(noteContents).exists));
		tokensElement.textContent = tokens + " tokens";

		const viewContentsButton = itemContainer.createEl("button", "item-button-qg");
		setIconAndTooltip(viewContentsButton, "eye", "View contents");
		viewContentsButton.addEventListener("click", async (): Promise<void> => {
			new NoteViewerModal(this.app, item).open();
		});
	}
}
