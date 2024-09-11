export const enum SaveFormat {
	CALLOUT = "Callout",
	SPACED_REPETITION = "Spaced Repetition",
}

export const saveFormats: Record<SaveFormat, string> = {
	[SaveFormat.CALLOUT]: "Callout",
	[SaveFormat.SPACED_REPETITION]: "Spaced Repetition",
};

export interface SavingConfig {
	autoSave: boolean;
	savePath: string;
	saveFormat: string;
	quizMaterialProperty: string;
	inlineSeparator: string;
	multilineSeparator: string;
}

export const DEFAULT_SAVING_SETTINGS: SavingConfig = {
	autoSave: false,
	savePath: "/",
	saveFormat: SaveFormat.CALLOUT,
	quizMaterialProperty: "sources",
	inlineSeparator: "::",
	multilineSeparator: "?",
};
