import { App } from "obsidian";
import { Question, QuizSettings } from "../../../utils/types";
import QuizModal from "./QuizModal";

interface QuizModalWrapperProps {
	app: App;
	settings: QuizSettings;
	quiz: Question[];
	initialSavedQuestions: boolean[];
	fileName: string;
	validSavePath: boolean;
	handleClose: () => void;
}

const QuizModalWrapper = ({ app, settings, quiz, initialSavedQuestions, fileName, validSavePath, handleClose }: QuizModalWrapperProps) => {
	return <QuizModal
		app={app}
		settings={settings}
		quiz={quiz}
		initialSavedQuestions={initialSavedQuestions}
		fileName={fileName}
		validSavePath={validSavePath}
		handleClose={handleClose}
	/>;
};

export default QuizModalWrapper;
