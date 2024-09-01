export enum Provider {
	OPENAI = "OPENAI",
	GOOGLE = "GOOGLE",
	ANTHROPIC = "ANTHROPIC",
	PERPLEXITY = "PERPLEXITY",
	MISTRAL = "MISTRAL"
}

export const providers: Record<Provider, string> = {
	[Provider.OPENAI]: "OpenAI",
	[Provider.GOOGLE]: "Google",
	[Provider.ANTHROPIC]: "Anthropic",
	[Provider.PERPLEXITY]: "Perplexity",
	[Provider.MISTRAL]: "Mistral",
};
