import {App, normalizePath, Notice, TAbstractFile, TFile, TFolder} from "obsidian";
import {Question, QuizSettings} from "../../../utils/types";
import {useEffect, useMemo, useState} from "react";
import IconButton from "../buttons/IconButton";

interface QuizModalProps {
	app: App;
	settings: QuizSettings;
	questions: Question[]; // randomize when passing instead of inside this component
	initialSavedQuestions: boolean[];
}

const QuizModal = ({ app, settings, questions, initialSavedQuestions }: QuizModalProps) => {
	const [questionIndex, setQuestionIndex] = useState<number>(0);
	const [savedQuestions, setSavedQuestions] = useState<boolean[]>(initialSavedQuestions);

	useEffect(() => {
		if (settings.autoSave) {
			handleSaveAllQuestions();
		}
	}, []);

	const [fileName, validPath] = useMemo<[string, boolean]>(() => {
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
	}, []);
	const fileCreated = useMemo<boolean>(() => {
		return savedQuestions.includes(true);
	}, [savedQuestions]);

	const handleClose = () => {

	};

	const handleOutsideClick = () => {

	};

	const handlePreviousQuestion = () => {
		if (questionIndex > 0) {
			setQuestionIndex(questionIndex - 1);
		}
	};

	const handleSaveQuestion = () => {
		const updatedSavedQuestions = [...savedQuestions];
		updatedSavedQuestions[questionIndex] = true;
		setSavedQuestions(updatedSavedQuestions);
		// call QuestionSaver here

		if (validPath) {
			new Notice("Question saved");
		} else {
			new Notice("Invalid path: Question saved in vault root folder");
		}
	};

	const handleSaveAllQuestions = () => {
		const updatedSavedQuestions = savedQuestions.map(() => true);
		setSavedQuestions(updatedSavedQuestions);
		// call QuestionSaver here (create new saveAllQuestions function in QuestionSaver)

		if (validPath) {
			new Notice("All questions saved");
		} else {
			new Notice("Invalid path: All questions saved in vault root folder");
		}
	};

	const handleNextQuestion = () => {
		if (questionIndex < questions.length - 1) {
			setQuestionIndex(questionIndex + 1);
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
					<hr className="quiz-divider"/>
				{/*	render question here */}
				</div>
			</div>
		</div>
	);
};

export default QuizModal;
