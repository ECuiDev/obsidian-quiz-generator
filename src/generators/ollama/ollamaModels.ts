import { Notice } from "obsidian";
import { Ollama } from "ollama/dist/browser.mjs";

export const getOllamaTextGenModels = async (baseUrl: string): Promise<Record<string, string>> => {
	const models = await getOllamaModels(baseUrl);
	return Object.fromEntries(Object.entries(models).filter(([model]) => !model.includes("embed")));
};

export const getOllamaEmbeddingModels = async (baseUrl: string): Promise<Record<string, string>> => {
	const models = await getOllamaModels(baseUrl);
	return Object.fromEntries(Object.entries(models).filter(([model]) => model.includes("embed")));
};

const getOllamaModels = async (baseUrl: string): Promise<Record<string, string>> => {
	try {
		const ollama = new Ollama({ host: baseUrl });
		const models = await ollama.list();
		return models.models.reduce((acc, model) => {
			acc[model.name] = model.name;
			return acc;
		}, {} as Record<string, string>);
	} catch (error) {
		new Notice("Error: Ollama not running");
		return {};
	}
};
