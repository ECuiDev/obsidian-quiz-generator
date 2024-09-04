export interface OllamaConfig {
	ollamaBaseURL: string;
	ollamaTextGenModel: string;
}

export const DEFAULT_OLLAMA_SETTINGS: OllamaConfig = {
	ollamaBaseURL: "http://localhost:11434",
	ollamaTextGenModel: "",
};
