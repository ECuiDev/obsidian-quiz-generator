import { App } from "obsidian";
import { Question, QuizSettings } from "../../../utils/types";
import QuizModal from "./QuizModal";

interface QuizModalWrapperProps {
	app: App;
	settings: QuizSettings;
	questions: Question[];
	initialSavedQuestions: boolean[];
	fileName: string;
	validSavePath: boolean;
	handleClose: () => void;
}

const QuizModalWrapper = ({ app, settings, questions, initialSavedQuestions, fileName, validSavePath, handleClose }: QuizModalWrapperProps) => {
	return <QuizModal
		app={app}
		settings={settings}
		questions={questions}
		initialSavedQuestions={initialSavedQuestions}
		fileName={fileName}
		validSavePath={validSavePath}
		handleClose={handleClose}
	/>;
}

export default QuizModalWrapper;
