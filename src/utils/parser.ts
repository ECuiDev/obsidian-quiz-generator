export function removeFrontMatter(input: string) {
	const yamlFrontMatterRegex = /---[\s\S]+?---\n/;
	return input.replace(yamlFrontMatterRegex, "");
}

export function cleanUpLinks(input: string) {
	const combinedRegex = /\[\[([^\]|]+)(?:\|([^\]]+))??]]|\[([^\]]+)]\([^)]+\)/g;

	return input.replace(combinedRegex, (match, wikiLink, wikiDisplayText, markdownLink) => {
		if (wikiLink) {
			return wikiDisplayText ? wikiDisplayText : wikiLink;
		} else if (markdownLink) {
			return markdownLink;
		}
	});
}

export function removeMarkdownHeadings(input: string) {
	const headingRegex = /^(#+\s+.*)$/gm;
	return input.replace(headingRegex, "");
}

export function removeMarkdownFormatting(input: string) {
	const markdownFormattingRegex = /(\*\*\*|___|\*\*|__|\*|_|~~|==)(.*?)\1/g;
	return input.replace(markdownFormattingRegex, "$2");
}

export function removeSpecialCharacters(input: string) {
	const regex = /[\n\\`]/g;
	return input.replace(regex, "");
}

export function cleanUpWhiteSpace(input: string) {
	const consecutiveSpacesRegex = /\s+/g;
	return input.replace(consecutiveSpacesRegex, " ").trim();
}
