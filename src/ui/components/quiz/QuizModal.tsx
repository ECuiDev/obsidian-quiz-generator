import { App, Notice } from "obsidian";
import { useState } from "react";
import { Question, QuizSettings } from "../../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply, isShortOrLongAnswer,
	isTrueFalse
} from "../../../utils/typeGuards";
import IconButton from "../IconButton";
import TrueFalseQuestion from "./TrueFalseQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import ShortOrLongAnswerQuestion from "./ShortOrLongAnswerQuestion";
import QuestionSaver from "../../../services/questionSaver";

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	questions: Question[];
	initialSavedQuestions: boolean[];
	fileName: string;
	validSavePath: boolean;
}

const QuizModal = ({ app, settings, questions, initialSavedQuestions, fileName, validSavePath }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(initialSavedQuestions);

	const handleClose = () => {

	};

	const handleOutsideClick = () => {

	};

	const handlePreviousQuestion = () => {
		if (questionIndex > 0) {
			setQuestionIndex(questionIndex - 1);
		}
	};

	const handleSaveQuestion = async () => {
		const updatedSavedQuestions = [...savedQuestions];
		updatedSavedQuestions[questionIndex] = true;
		setSavedQuestions(updatedSavedQuestions);
		await new QuestionSaver(app, settings, questions, fileName, validSavePath, savedQuestions.includes(true)).saveQuestion(questionIndex);

		if (validSavePath) {
			new Notice("Question saved");
		} else {
			new Notice("Invalid save path: Question saved in vault root folder");
		}
	};

	const handleSaveAllQuestions = async () => {
		const unsavedQuestions = questions.filter((_, index) => !savedQuestions[index]);
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		await new QuestionSaver(app, settings, unsavedQuestions, fileName, validSavePath, savedQuestions.includes(true)).saveAllQuestions();

		if (validSavePath) {
			new Notice("All questions saved");
		} else {
			new Notice("Invalid save path: All questions saved in vault root folder");
		}
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
			<div className="modal-bg" style={{opacity: 0.85}} onClick={handleOutsideClick} />
			<div className="modal modal-el-container">
				<div className="modal-close-button" onClick={handleClose} />
				<div className="modal-title title-style">Question {questionIndex + 1}</div>
				<div className="modal-content modal-content-container">
					<div className="quiz-button-container">
						<IconButton
							icon="arrow-left"
							toolTip="Back"
							onClick={handlePreviousQuestion}
							isDisabled={questionIndex === 0}
						/>
						<IconButton
							icon="save"
							toolTip="Save"
							onClick={handleSaveQuestion}
							isDisabled={savedQuestions[questionIndex]}
						/>
						<IconButton
							icon="save-all"
							toolTip="Save all"
							onClick={handleSaveAllQuestions}
							isDisabled={!savedQuestions.includes(false)}
						/>
						<IconButton
							icon="arrow-right"
							toolTip="Next"
							onClick={handleNextQuestion}
							isDisabled={questionIndex === questions.length - 1}
						/>
					</div>
					<hr className="quiz-divider" />
					{renderQuestion()}
				</div>
			</div>
		</div>
	);
};

export default QuizModal;
