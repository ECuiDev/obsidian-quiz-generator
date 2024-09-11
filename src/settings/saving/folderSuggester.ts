import { AbstractInputSuggest, App } from "obsidian";

export default class FolderSuggester extends AbstractInputSuggest<string> {
	private readonly inputEl: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.inputEl = inputEl;
	}

	protected getSuggestions(query: string): string[] {
		return this.app.vault.getAllFolders(true)
			.map(folder => folder.path)
			.filter(path => path.toLowerCase().contains(query.toLowerCase()));
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
