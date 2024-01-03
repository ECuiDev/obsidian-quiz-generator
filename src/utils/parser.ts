export function cleanUpString(input: string) {
	let cleanedString = removeFrontMatter(input);
	cleanedString = cleanUpLinks(cleanedString);
	cleanedString = removeMarkdownHeadings(cleanedString);
	cleanedString = removeMarkdownFormatting(cleanedString);
	cleanedString = removeSpecialCharacters(cleanedString);

	return cleanUpWhiteSpace(cleanedString);
}

export function cleanUpPrompt(input: string) {
	return cleanUpWhiteSpace(removeSpecialCharacters(input));
}

function removeFrontMatter(input: string) {
	const yamlFrontMatterRegex = /---[\s\S]+?---\n/;
	return input.replace(yamlFrontMatterRegex, "");
}

function cleanUpLinks(input: string) {
	const combinedRegex = /\[\[([^\]|]+)(?:\|([^\]]+))??]]|\[([^\]]+)]\([^)]+\)/g;

	return input.replace(combinedRegex, (match, wikiLink, wikiDisplayText, markdownLink) => {
		if (wikiLink) {
			return wikiDisplayText ? wikiDisplayText : wikiLink;
		} else if (markdownLink) {
			return markdownLink;
		}
	});
}

function removeMarkdownHeadings(input: string) {
	const headingRegex = /^(#+\s+.*)$/gm;
	return input.replace(headingRegex, "");
}

function removeMarkdownFormatting(input: string) {
	const markdownFormattingRegex = /(\*\*\*|___|\*\*|__|\*|_|~~|==|%%)(.*?)\1/g;
	return input.replace(markdownFormattingRegex, "$2");
}

function removeSpecialCharacters(input: string) {
	const regex = /[\n\\`\t]/g;
	return input.replace(regex, "");
}

function cleanUpWhiteSpace(input: string) {
	const consecutiveSpacesRegex = /\s+/g;
	return input.replace(consecutiveSpacesRegex, " ").trim();
}
