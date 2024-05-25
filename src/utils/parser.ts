export function cleanUpNoteContents(noteContents: string, hasFrontMatter: boolean): string {
	let cleanedContents = noteContents;
	if (hasFrontMatter) {
		cleanedContents = removeFrontMatter(cleanedContents);
	}
	cleanedContents = cleanUpLinks(cleanedContents);
	cleanedContents = removeMarkdownHeadings(cleanedContents);
	cleanedContents = removeMarkdownFormatting(cleanedContents);
	cleanedContents = removeSpecialCharacters(cleanedContents);
	return cleanUpWhiteSpace(cleanedContents);
}

function removeFrontMatter(input: string): string {
	const yamlFrontMatterRegex = /---[\s\S]+?---\n/;
	return input.replace(yamlFrontMatterRegex, "");
}

function cleanUpLinks(input: string): string {
	const combinedRegex = /\[\[([^\]|]+)(?:\|([^\]]+))??]]|\[([^\]]+)]\([^)]+\)/g;

	return input.replace(combinedRegex, (match, wikiLink, wikiDisplayText, markdownLink) => {
		if (wikiLink) {
			return wikiDisplayText ? wikiDisplayText : wikiLink;
		} else if (markdownLink) {
			return markdownLink;
		}
	});
}

function removeMarkdownHeadings(input: string): string {
	const headingRegex = /^(#+\s+.*)$/gm;
	return input.replace(headingRegex, "");
}

function removeMarkdownFormatting(input: string): string {
	const markdownFormattingRegex = /(\*\*\*|___|\*\*|__|\*|_|~~|==|%%)(.*?)\1/g;
	return input.replace(markdownFormattingRegex, "$2");
}

function removeSpecialCharacters(input: string): string {
	const regex = /[\n`\t]/g;
	return input.replace(regex, "");
}

function cleanUpWhiteSpace(input: string): string {
	const consecutiveSpacesRegex = /\s+/g;
	return input.replace(consecutiveSpacesRegex, " ").trim();
}
