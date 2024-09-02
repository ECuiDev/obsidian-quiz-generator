export const enum CohereTextGenModel {
	COMMAND_R = "command-r-08-2024",
	COMMAND_R_PLUS = "command-r-plus-08-2024",
}

export const cohereTextGenModels: Record<CohereTextGenModel, string> = {
	[CohereTextGenModel.COMMAND_R]: "Command R",
	[CohereTextGenModel.COMMAND_R_PLUS]: "Command R+",
};
