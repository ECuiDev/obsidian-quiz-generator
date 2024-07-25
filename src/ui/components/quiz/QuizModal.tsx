import { App, normalizePath, Notice, TAbstractFile, TFile, TFolder } from "obsidian";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Question, QuizSettings } from "../../../utils/types";
import {
	isFillInTheBlank,
	isMatching,
	isMultipleChoice,
	isSelectAllThatApply, isShortOrLongAnswer,
	isTrueFalse
} from "../../../utils/typeGuards";
import IconButton from "../buttons/IconButton";
import TrueFalseQuestion from "./TrueFalseQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import ShortOrLongAnswerQuestion from "./ShortOrLongAnswerQuestion";
import QuestionSaver from "../../../services/questionSaver";

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	questions: Question[]; // randomize when passing instead of inside this component
	initialSavedQuestions: boolean[];
}

const QuizModal = ({ app, settings, questions, initialSavedQuestions }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(initialSavedQuestions);
	// move into a new QuizModalLogic.ts file/class that instantiates these fields privately
	// access using getters when you need them here
	// maybe instantiate this component from there too?
	const [fileName, validSavePath] = useMemo<[string, boolean]>(() => {
		const getFileNames = (folder: TFolder): string[] => {
			return folder.children
				.filter((file: TAbstractFile) => file instanceof TFile)
				.map((file: TFile) => file.name.toLowerCase())
				.filter((name: string) => name.startsWith("quiz"));
		};

		let count = 1;
		let fileNames: string[];
		let validPath: boolean;
		const folder = app.vault.getAbstractFileByPath(normalizePath(settings.questionSavePath.trim()));

		if (folder instanceof TFolder) {
			fileNames = getFileNames(folder);
			validPath = true;
		} else {
			fileNames = getFileNames(app.vault.getRoot());
			validPath = false;
		}

		while (fileNames.includes(`quiz ${count}.md`)) {
			count++;
		}

		return [`Quiz ${count}.md`, validPath];
	}, [app, settings]);
	// Can probably replace everywhere with just savedQuestions.includes(true)
	const fileCreated = useMemo<boolean>(() => savedQuestions.includes(true), [savedQuestions]);

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
		await new QuestionSaver(app, settings, questions, fileName, validSavePath, fileCreated).saveQuestion(questionIndex);

		if (validSavePath) {
			new Notice("Question saved");
		} else {
			new Notice("Invalid path: Question saved in vault root folder");
		}
	};

	const handleSaveAllQuestions = useCallback(async () => {
		const unsavedQuestions = questions.filter((_, index) => !savedQuestions[index]);
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		await new QuestionSaver(app, settings, unsavedQuestions, fileName, validSavePath, fileCreated).saveAllQuestions();

		if (validSavePath) {
			new Notice("All questions saved");
		} else {
			new Notice("Invalid path: All questions saved in vault root folder");
		}
	}, [app, settings, questions, savedQuestions, fileName, validSavePath, fileCreated]);

	const handleNextQuestion = () => {
		if (questionIndex < questions.length - 1) {
			setQuestionIndex(questionIndex + 1);
		}
	};

	useEffect(() => {
		if (settings.autoSave && savedQuestions.every(value => value)) {
			handleSaveAllQuestions();
		}
	}, [handleSaveAllQuestions, settings, savedQuestions]);

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
