export const languages: Record<string, string> = {
	English: "English",
	German: "Deutsch",
	Spanish: "Español",
	French: "Français",
	Russian: "Pусский",
	Chinese: "中文",
	Portuguese: "Português",
	Korean: "한국어",
	Japanese: "日本語",
	Arabic: "العربية",
	Danish: "Dansk",
	Norwegian: "Norsk",
	Dutch: "Nederlands",
	Italian: "Italiano",
	Polish: "Polski",
	Hindi: "हिन्दी",
	Vietnamese: "Tiếng Việt",
	Ukrainian: "українська",
	Swedish: "Svenska",
	Persian: "فارسی",
	Greek: "Ελληνικά",
	Indonesian: "Bahasa Indonesia",
};

export interface GeneralConfig {
	showNotePath: boolean;
	showFolderPath: boolean;
	includeSubfolderNotes: boolean;
	randomizeQuestions: boolean;
	language: string;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralConfig = {
	showNotePath: false,
	showFolderPath: false,
	includeSubfolderNotes: true,
	randomizeQuestions: true,
	language: "English",
};
