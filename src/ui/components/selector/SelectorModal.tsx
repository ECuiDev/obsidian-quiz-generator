import React, { useState, useEffect, useRef, ReactElement } from 'react';
import { App, Vault, Notice, TFile, TFolder } from "obsidian";
import GptGenerator from "../../../generators/gptGenerator";
import QuizGenerator from "../../../main";
import { cleanUpString } from "../../../utils/parser";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA, SelectedNote } from "../../../utils/types";
import NoteAdder from "../../noteAdder";
import FolderAdder from "../../folderAdder";
import "styles.css";
import QuizUI from "../../quizUI";
import SelectorButton from "./buttons/SelectorButton";
import NoteContainer from "./NoteContainer";
import FolderContainer from "./FolderContainer";

interface SelectorModalProps {
	app: App;
	plugin: QuizGenerator;
	parent: HTMLDivElement;
}

const SelectorModal = ({ app, plugin, parent }: SelectorModalProps) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const [notePaths, setNotePaths] = useState<string[]>([]);
	const [folderPaths, setFolderPaths] = useState<string[]>([]);
	const [selectedNotes, setSelectedNotes] = useState<SelectedNote[]>([]);
	const [questionsAndAnswers, setQuestionsAndAnswers] = useState<(ParsedMC | ParsedTF | ParsedSA)[]>([]); // PRETTY SURE THIS ACTUALLY ISN'T NEEDED (CHANGE TO LOCAL VAR)
	const [promptTokens, setPromptTokens] = useState<number>(0);
	const [clearButtonDisabled, setClearButtonDisabled] = useState<boolean>(true);
	const [quizButtonDisabled, setQuizButtonDisabled] = useState<boolean>(true);
	const [generateButtonDisabled, setGenerateButtonDisabled] = useState<boolean>(true);
	const [quiz, setQuiz] = useState<QuizUI>();
	const [notesContainerChildren, setNotesContainerChildren] = useState<ReactElement[]>([]);

	useEffect(() => {
		setNotePaths(app.vault.getMarkdownFiles().map(file => file.path));
		setFolderPaths(app.vault.getAllLoadedFiles().filter(abstractFile => abstractFile instanceof TFolder).map(folder => folder.path));
	}, []);

	const close = (): void => {
		document.body.removeChild(parent);
	};

	const clearHandler = async (): Promise<void> => {
		setClearButtonDisabled(true);
		setGenerateButtonDisabled(true);
		setSelectedNotes([]);
		setNotesContainerChildren([]);
		setPromptTokens(0);
		// update tokenSection text content (should be done automatically when setPromptTokens runs?)
		setNotePaths(app.vault.getMarkdownFiles().map(file => file.path)); // good
		setFolderPaths(app.vault.getAllLoadedFiles().filter(abstractFile => abstractFile instanceof TFolder).map(folder => folder.path)); // good
	};

	const quizHandler = async (): Promise<void> => {
		quiz?.open();
	};

	const addNoteHandler = async (): Promise<void> => {
		await showNoteAdder(); // when merging pass notePaths or folderPaths as arguments
	};

	const addFolderHandler = async (): Promise<void> => {
		await showFolderAdder();
	};

	const generateHandler = async (): Promise<void> => {
		if ((plugin.settings.generateMultipleChoice || plugin.settings.generateTrueFalse
			|| plugin.settings.generateShortAnswer) && promptTokens > 0) {
			setGenerateButtonDisabled(true);
			setQuestionsAndAnswers([]);
			const generator = new GptGenerator(plugin);

			new Notice("Generating...");
			let questions = await generator.generateQuestions(loadNoteContents());
			questions = questions?.replace(/\\/g, "\\\\");

			if (questions) {
				try {
					const parsedQuestions: ParsedQuestions = JSON.parse(questions);

					for (const key in parsedQuestions) {
						if (parsedQuestions.hasOwnProperty(key)) {
							const value = parsedQuestions[key];

							if (Array.isArray(value)) {
								value.forEach(element => {
									if ("questionMC" in element) {
										questionsAndAnswers.push(element as ParsedMC);
									} else if ("questionTF" in element) {
										questionsAndAnswers.push(element as ParsedTF);
									} else if ("questionSA" in element) {
										questionsAndAnswers.push(element as ParsedSA);
									} else {
										new Notice("A question was generated incorrectly");
									}
								});
							} else {
								new Notice("Failure: Generation returned incorrect format");
							}
						}
					}

					setQuiz(new QuizUI(app, plugin, questionsAndAnswers));
					quiz?.open();
				} catch (error) {
					new Notice(error);
				}
			} else {
				new Notice("Failure: Generation returned null");
			}

			setGenerateButtonDisabled(false);
			setQuizButtonDisabled(false);
		} else {
			new Notice("Generation cancelled because all question types are set to false or prompt contains 0 tokens");
		}
	};

	const showNoteAdder = async (): Promise<void> => {
		if (modalRef.current) {
			const modal = new NoteAdder(app, notePaths, modalRef.current);

			modal.setCallback(async (selectedItem: string) => {
				const selectedNote = app.vault.getFileByPath(selectedItem);

				if (selectedNote instanceof TFile) {
					setNotePaths(paths => paths.filter(element => element !== selectedNote.path)); // good
					await showNoteAdder();
					const path = selectedNote.path;
					const contents = cleanUpString(await app.vault.cachedRead(selectedNote));
					setSelectedNotes(prevNotes => [...prevNotes, { path, contents }]); // FIX THIS
					console.log(selectedNotes);
					await displayNote(selectedNote);
				}
			});

			modal.open();
		}
	};

	const showFolderAdder = async (): Promise<void> => {
		if (modalRef.current) {
			const modal = new FolderAdder(app, folderPaths, modalRef.current);

			modal.setCallback(async (selectedItem: string) => {
				const selectedFolder = app.vault.getFolderByPath(selectedItem);

				if (selectedFolder instanceof TFolder) {
					setFolderPaths(paths => paths.filter(element => element !== selectedFolder.path)); // good
					await showFolderAdder();

					let folderContents: string[] = [];
					const promises: any[] = [];

					Vault.recurseChildren(selectedFolder, (file) => {
						if (file instanceof TFile && file.extension === "md") {
							promises.push(
								(async () => {
									folderContents.push(cleanUpString(await app.vault.cachedRead(file)));
								})()
							);
						}
					});

					await Promise.all(promises);

					const path = selectedFolder.path;
					const contents = folderContents.join(" ");
					setSelectedNotes(prevNotes => [...prevNotes, { path, contents }]); // FIX
					await displayFolder(selectedFolder);
				}
			});

			modal.open();
		}
	};

	const displayNote = async (note: TFile): Promise<void> => {
		setClearButtonDisabled(false);
		setGenerateButtonDisabled(false);
		const noteTokens = countNoteTokens(selectedNotes.find(entry => entry.path === note.path)?.contents);

		await addNoteContainer(note, noteTokens);
		// when merging can use TAbstractFile? or maybe just TFile | TFolder
		setPromptTokens(prevPromptTokens => prevPromptTokens + noteTokens); // good
		// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this
	};

	const displayFolder = async (folder: TFolder): Promise<void> => {
		setClearButtonDisabled(false);
		setGenerateButtonDisabled(false);
		const noteTokens = countNoteTokens(selectedNotes.find(entry => entry.path === folder.path)?.contents);

		await addFolderContainer(folder, noteTokens);

		setPromptTokens(prevPromptTokens => prevPromptTokens + noteTokens); // good
		// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this
	};

	const addNoteContainer = async (note: TFile, tokens: number): Promise<void> => {
		const key = note.path; // good

		const removeHandler = async (): Promise<void> => {
			setSelectedNotes(prevNotes => prevNotes.filter(entry => entry.path !== note.path)); // good, replace with key

			setNotesContainerChildren(children => children.filter(child => child.key !== key)); // good
			
			setNotePaths(paths => [...paths, note.path]);
			setPromptTokens(prevPromptTokens => prevPromptTokens - tokens); // good
			// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this

			if (selectedNotes.length === 0) {
				setClearButtonDisabled(true);
				setGenerateButtonDisabled(true);
			}
		};

		const newNoteContainer = <NoteContainer key={key} showPath={plugin.settings.showNotePath} path={note.path} basename={note.basename} tokens={tokens} onClick={removeHandler}></NoteContainer>;
		setNotesContainerChildren(children => [...children, newNoteContainer]); // good
	};

	const addFolderContainer = async (folder: TFolder, tokens: number): Promise<void> => {
		const key = folder.path; // good

		const removeHandler = async (): Promise<void> => {
			setSelectedNotes(prevNotes => prevNotes.filter(entry => entry.path !== folder.path)); // good

			setNotesContainerChildren(children => children.filter(child => child.key !== key)); // good

			setFolderPaths(paths => [...paths, folder.path]);
			setPromptTokens(prevPromptTokens => prevPromptTokens - tokens); // good
			// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this

			if (selectedNotes.length === 0) {
				setClearButtonDisabled(true);
				setGenerateButtonDisabled(true);
			}
		};

		if (folder.path === "/") {
			const newFolderContainer = <FolderContainer key={key} showPath={true} path={app.vault.getName() + " (Vault)"} basename={folder.name} tokens={tokens} onClick={removeHandler}></FolderContainer>;
			setNotesContainerChildren(children => [...children, newFolderContainer]); // good
		} else {
			const newFolderContainer = <FolderContainer key={key} showPath={plugin.settings.showFolderPath} path={folder.path} basename={folder.name} tokens={tokens} onClick={removeHandler}></FolderContainer>;
			setNotesContainerChildren(children => [...children, newFolderContainer]); // good
		}
	};

	const countNoteTokens = (noteContents: string | undefined): number => {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	};

	const loadNoteContents = (): string[] => {
		const noteContents: string[] = [];

		for (const note of selectedNotes) {
			noteContents.push(note.contents);
		}

		return noteContents;
	};

	return (
		<>
			<div className="modal-bg" style={{opacity: 0.85}}></div>
			<div ref={modalRef} className="modal modal-el-container">
				<div className="modal-close-button" onClick={close}></div>
				<div className="modal-title title-style">Selected Notes</div>
				<div className="modal-content modal-content-container">
					<div className="notes-container">
						{notesContainerChildren}
					</div>
					<span className="token-container">Prompt tokens: {promptTokens}</span>
					<div className="selector-button-container">
						<SelectorButton icon="book-x" toolTip="Remove all" onClick={clearHandler} isDisabled={clearButtonDisabled}></SelectorButton>
						<SelectorButton icon="scroll-text" toolTip="Open quiz" onClick={quizHandler} isDisabled={quizButtonDisabled}></SelectorButton>
						<SelectorButton icon="file-plus-2" toolTip="Add note" onClick={addNoteHandler} isDisabled={false}></SelectorButton>
						<SelectorButton icon="folder-plus" toolTip="Add folder" onClick={addFolderHandler} isDisabled={false}></SelectorButton>
						<SelectorButton icon="webhook" toolTip="Generate" onClick={generateHandler} isDisabled={generateButtonDisabled}></SelectorButton>
					</div>
				</div>
			</div>
		</>
	);
};

export default SelectorModal;
