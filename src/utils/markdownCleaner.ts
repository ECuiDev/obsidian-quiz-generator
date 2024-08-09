export const cleanUpNoteContents = (noteContents: string, hasFrontMatter: boolean): string => {
	let cleanedContents = noteContents;
	if (hasFrontMatter) {
		cleanedContents = removeFrontMatter(cleanedContents);
	}
	cleanedContents = cleanUpLinks(cleanedContents);
	cleanedContents = removeMarkdownHeadings(cleanedContents);
	cleanedContents = removeMarkdownFormatting(cleanedContents);
	cleanedContents = removeSpecialCharacters(cleanedContents);
	return cleanUpWhiteSpace(cleanedContents);
};

const removeFrontMatter = (input: string): string => {
	const yamlFrontMatterRegex = /---[\s\S]+?---\n/;
	return input.replace(yamlFrontMatterRegex, "");
};

const cleanUpLinks = (input: string): string => {
	const combinedRegex = /\[\[([^\]|]+)(?:\|([^\]]+))??]]|\[([^\]]+)]\([^)]+\)/g;

	return input.replace(combinedRegex, (match, wikiLink, wikiDisplayText, markdownLink) => {
		if (wikiLink) {
			return wikiDisplayText ? wikiDisplayText : wikiLink;
		} else if (markdownLink) {
			return markdownLink;
		}
	});
};

const removeMarkdownHeadings = (input: string): string => {
	const headingRegex = /^(#+\s+.*)$/gm;
	return input.replace(headingRegex, "");
};

const removeMarkdownFormatting = (input: string): string => {
	const markdownFormattingRegex = /(\*\*\*|___|\*\*|__|\*|_|~~|==|%%)(.*?)\1/g;
	return input.replace(markdownFormattingRegex, "$2");
};

const removeSpecialCharacters = (input: string): string => {
	const regex = /[\n`\t]/g;
	return input.replace(regex, "");
};

const cleanUpWhiteSpace = (input: string): string => {
	const consecutiveSpacesRegex = /\s+/g;
	return input.replace(consecutiveSpacesRegex, " ").trim();
};
