import { App } from "obsidian";
import { useState } from "react";
import { QuizSettings } from "../../settings/config";
import { Question } from "../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply,
	isShortOrLongAnswer,
	isTrueFalse
} from "../../utils/typeGuards";
import ModalButton from "../components/ModalButton";
import TrueFalseQuestion from "./TrueFalseQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import SelectAllThatApplyQuestion from "./SelectAllThatApplyQuestion";
import FillInTheBlankQuestion from "./FillInTheBlankQuestion";
import MatchingQuestion from "./MatchingQuestion";
import ShortOrLongAnswerQuestion from "./ShortOrLongAnswerQuestion";
import QuizSaver from "../../services/quizSaver";

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	quiz: Question[];
	quizSaver: QuizSaver;
	reviewing: boolean;
	handleClose: () => void;
}

const QuizModal = ({ app, settings, quiz, quizSaver, reviewing, handleClose }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(Array(quiz.length).fill(reviewing));

	const handlePreviousQuestion = () => {
		if (questionIndex > 0) {
			setQuestionIndex(questionIndex - 1);
		}
	};

	const handleSaveQuestion = async () => {
		const updatedSavedQuestions = [...savedQuestions];
		updatedSavedQuestions[questionIndex] = true;
		setSavedQuestions(updatedSavedQuestions);
		await quizSaver.saveQuestion(quiz[questionIndex]);
	};

	const handleSaveAllQuestions = async () => {
		const unsavedQuestions = quiz.filter((_, index) => !savedQuestions[index]);
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		await quizSaver.saveAllQuestions(unsavedQuestions);
	};

	const handleNextQuestion = () => {
		if (questionIndex < quiz.length - 1) {
			setQuestionIndex(questionIndex + 1);
		}
	};

	const renderQuestion = () => {
		const question = quiz[questionIndex];
		if (isTrueFalse(question)) {
			return <TrueFalseQuestion key={questionIndex} app={app} question={question} />;
		} else if (isMultipleChoice(question)) {
			return <MultipleChoiceQuestion key={questionIndex} app={app} question={question} />;
		} else if (isSelectAllThatApply(question)) {
			return <SelectAllThatApplyQuestion key={questionIndex} app={app} question={question} />;
		} else if (isFillInTheBlank(question)) {
			return <FillInTheBlankQuestion key={questionIndex} app={app} question={question} />;
		} else if (isMatching(question)) {
			return <MatchingQuestion key={questionIndex} app={app} question={question} />;
		} else if (isShortOrLongAnswer(question)) {
			return <ShortOrLongAnswerQuestion key={questionIndex} app={app} question={question} settings={settings} />;
		}
	};

	return (
		<div className="modal-container mod-dim">
			<div className="modal-bg" style={{opacity: 0.85}} onClick={handleClose} />
			<div className="modal modal-qg">
				<div className="modal-close-button" onClick={handleClose} />
				<div className="modal-header">
					<div className="modal-title modal-title-qg">Question {questionIndex + 1} of {quiz.length}</div>
				</div>
				<div className="modal-content modal-content-flex-qg">
					<div className="modal-button-container-qg">
						<ModalButton
							icon="arrow-left"
							tooltip="Back"
							onClick={handlePreviousQuestion}
							disabled={questionIndex === 0}
						/>
						<ModalButton
							icon="save"
							tooltip="Save"
							onClick={handleSaveQuestion}
							disabled={savedQuestions[questionIndex]}
						/>
						<ModalButton
							icon="save-all"
							tooltip="Save all"
							onClick={handleSaveAllQuestions}
							disabled={!savedQuestions.includes(false)}
						/>
						<ModalButton
							icon="arrow-right"
							tooltip="Next"
							onClick={handleNextQuestion}
							disabled={questionIndex === quiz.length - 1}
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
