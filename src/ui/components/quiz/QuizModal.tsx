import { App } from "obsidian";
import { useState } from "react";
import { Question, QuizSettings } from "../../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../../../utils/typeGuards";
import ModalButton from "../ModalButton";
import TrueFalseQuestion from "./TrueFalseQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import ShortOrLongAnswerQuestion from "./ShortOrLongAnswerQuestion";
import QuizSaver from "../../../services/quizSaver";

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	questions: Question[];
	initialSavedQuestions: boolean[];
	fileName: string;
	validSavePath: boolean;
	handleClose: () => void;
}

const QuizModal = ({ app, settings, questions, initialSavedQuestions, fileName, validSavePath, handleClose }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(initialSavedQuestions);

	const handlePreviousQuestion = () => {
		if (questionIndex > 0) {
			setQuestionIndex(questionIndex - 1);
		}
	};

	const handleSaveQuestion = async () => {
		const updatedSavedQuestions = [...savedQuestions];
		updatedSavedQuestions[questionIndex] = true;
		setSavedQuestions(updatedSavedQuestions);
		await new QuizSaver(app, settings, questions, fileName, validSavePath, savedQuestions.includes(true)).saveQuestion(questionIndex);
	};

	const handleSaveAllQuestions = async () => {
		const unsavedQuestions = questions.filter((_, index) => !savedQuestions[index]);
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		await new QuizSaver(app, settings, unsavedQuestions, fileName, validSavePath, savedQuestions.includes(true)).saveAllQuestions();
	};

	const handleNextQuestion = () => {
		if (questionIndex < questions.length - 1) {
			setQuestionIndex(questionIndex + 1);
		}
	};

	const renderQuestion = () => {
		const question = questions[questionIndex];
		if (isTrueFalse(question)) {
			return <TrueFalseQuestion app={app} question={question} />;
		} else if (isMultipleChoice(question)) {
			return <MultipleChoiceQuestion app={app} question={question} />;
		} else if (isSelectAllThatApply(question)) {
			return <div>Placeholder</div>;
		} else if (isFillInTheBlank(question)) {
			return <div>Placeholder</div>;
		} else if (isMatching(question)) {
			return <div>Placeholder</div>;
		} else if (isShortOrLongAnswer(question)) {
			return <ShortOrLongAnswerQuestion app={app} question={question} />;
		}
	};

	return (
		<div className="modal-container mod-dim">
			<div className="modal-bg" style={{opacity: 0.85}} onClick={handleClose} />
			<div className="modal modal-qg">
				<div className="modal-close-button" onClick={handleClose} />
				<div className="modal-title modal-title-qg">Question {questionIndex + 1}</div>
				<div className="modal-content modal-content-qg">
					<div className="modal-button-container-qg">
						<ModalButton
							icon="arrow-left"
							tooltip="Back"
							onClick={handlePreviousQuestion}
							isDisabled={questionIndex === 0}
						/>
						<ModalButton
							icon="save"
							tooltip="Save"
							onClick={handleSaveQuestion}
							isDisabled={savedQuestions[questionIndex]}
						/>
						<ModalButton
							icon="save-all"
							tooltip="Save all"
							onClick={handleSaveAllQuestions}
							isDisabled={!savedQuestions.includes(false)}
						/>
						<ModalButton
							icon="arrow-right"
							tooltip="Next"
							onClick={handleNextQuestion}
							isDisabled={questionIndex === questions.length - 1}
						/>
					</div>
					<hr className="quiz-divider-qg" />
					{renderQuestion()}
				</div>
			</div>
		</div>
	);
};

export default QuizModal;
