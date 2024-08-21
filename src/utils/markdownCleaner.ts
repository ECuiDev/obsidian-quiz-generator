export const cleanUpNoteContents = (noteContents: string, hasFrontMatter: boolean): string => {
	let cleanedContents = noteContents;
	if (hasFrontMatter) {
		cleanedContents = removeFrontMatter(cleanedContents);
	}
	cleanedContents = cleanUpLinks(cleanedContents);
	cleanedContents = removeMarkdownHeadings(cleanedContents);
	cleanedContents = removeMarkdownFormatting(cleanedContents);
	return cleanUpWhiteSpace(cleanedContents);
};

const removeFrontMatter = (input: string): string => {
	const yamlFrontMatterRegex = /---[\s\S]+?---\n/;
	return input.replace(yamlFrontMatterRegex, "");
};

const cleanUpLinks = (input: string): string => {
	const wikiLinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))??]]/;
	const markdownLinkPattern = /\[([^\]]+)]\([^)]+\)/;

	const combinedRegex = new RegExp(`${wikiLinkPattern.source}|${markdownLinkPattern.source}`, "g");

	return input.replace(combinedRegex, (match, wikiLink, wikiDisplayText, markdownLink) => {
		return wikiDisplayText ?? wikiLink ?? markdownLink;
	});
};

const removeMarkdownHeadings = (input: string): string => {
	const headingRegex = /^(#+.*)$/gm;
	return input.replace(headingRegex, "");
};

const removeMarkdownFormatting = (input: string): string => {
	const markdownFormattingRegex = /([*_]{1,3}|~~|==|%%)(.*?)\1/g;
	return input.replace(markdownFormattingRegex, "$2");
};

const cleanUpWhiteSpace = (input: string): string => {
	const consecutiveSpacesRegex = /\s+/g;
	return input.replace(consecutiveSpacesRegex, " ").trim();
};
