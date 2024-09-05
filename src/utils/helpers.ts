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

export const cosineSimilarity = (vec1: number[], vec2: number[]): number => {
	const dotProduct = (vec1: number[], vec2: number[]): number => {
		return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
	};
	const magnitude = (vec: number[]): number => {
		return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
	};

	const dot = dotProduct(vec1, vec2);
	const mag1 = magnitude(vec1);
	const mag2 = magnitude(vec2);
	return dot / (mag1 * mag2);
};
