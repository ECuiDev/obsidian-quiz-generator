import { AbstractInputSuggest, App, TAbstractFile, TFolder } from "obsidian";

export default class FolderSuggester extends AbstractInputSuggest<string> {
	private inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	protected getSuggestions(query: string): string[] {
		return this.app.vault.getAllLoadedFiles()
			.filter((abstractFile: TAbstractFile) => abstractFile instanceof TFolder)
			.map((folder: TAbstractFile) => folder.path)
			.filter((path: string) => path.toLowerCase().contains(query.toLowerCase()));
	}

	public renderSuggestion(folder: string, el: HTMLElement): void {
		el.setText(folder);
	}

	public selectSuggestion(folder: string): void {
		this.inputEl.value = folder;
		this.inputEl.trigger("input");
		this.close();
	}

}
