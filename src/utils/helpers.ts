import { setIcon, setTooltip } from "obsidian";

export const shuffleArray = <T>(array: T[]): T[] => {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
};

export const setIconAndTooltip = (element: HTMLElement, icon: string, tooltip: string): void => {
	setIcon(element, icon);
	setTooltip(element, tooltip);
};

export const countNoteTokens = (noteContents: string): number => {
	return Math.round(noteContents.length / 4);
};
