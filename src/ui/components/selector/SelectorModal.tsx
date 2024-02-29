import React, { useState, useRef, ReactElement } from 'react';
import { App, Vault, Notice, TFile, TFolder } from "obsidian";
import GptGenerator from "../../../generators/gptGenerator";
import QuizGenerator from "../../../main";
import { cleanUpString } from "../../../utils/parser";
import { ParsedQuestions, ParsedMC, ParsedTF, ParsedSA } from "../../../utils/types";
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

const SelectorModal: React.FC<SelectorModalProps> = ({ app, plugin, parent }) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const [notePaths, setNotePaths] = useState<string[]>(app.vault.getMarkdownFiles().map(file => file.path));
	const [folderPaths, setFolderPaths] = useState<string[]>(
		app.vault.getAllLoadedFiles()
			.filter(abstractFile => abstractFile instanceof TFolder)
			.map(folder => folder.path));
	const [selectedNotes, setSelectedNotes] = useState<Map<string, string>>(new Map<string, string>());
	const [questionsAndAnswers, setQuestionsAndAnswers] = useState<(ParsedMC | ParsedTF | ParsedSA)[]>([]);
	const [promptTokens, setPromptTokens] = useState<number>(0);
	const [clearButtonDisabled, setClearButtonDisabled] = useState<boolean>(true);
	const [quizButtonDisabled, setQuizButtonDisabled] = useState<boolean>(true);
	const [generateButtonDisabled, setGenerateButtonDisabled] = useState<boolean>(true);
	const [quiz, setQuiz] = useState<QuizUI>();
	const [notesContainerChildren, setNotesContainerChildren] = useState<ReactElement[]>([]); // add type here

	const close = () => {
		document.body.removeChild(parent);
	};

	const clearListener = async (): Promise<void> => {
		setClearButtonDisabled(true);
		setGenerateButtonDisabled(true);
		setSelectedNotes(new Map<string, string>());
		setNotesContainerChildren([]);
		setPromptTokens(0);
		// update tokenSection text content (should be done automatically when setPromptTokens runs?)
		setNotePaths(app.vault.getMarkdownFiles().map(file => file.path));
		setFolderPaths(app.vault.getAllLoadedFiles().filter(abstractFile => abstractFile instanceof TFolder).map(folder => folder.path));
	};

	const quizListener = async (): Promise<void> => {
		quiz?.open();
	};

	const addNoteListener = async (): Promise<void> => {
		await showNoteAdder();
	};

	const addFolderListener = async (): Promise<void> => {
		await showFolderAdder();
	};

	const generateListener = async (): Promise<void> => {
		if ((plugin.settings.generateMultipleChoice || plugin.settings.generateTrueFalse
			|| plugin.settings.generateShortAnswer) && promptTokens > 0) {
			setGenerateButtonDisabled(true);
			setQuestionsAndAnswers([]);
			const generator = new GptGenerator(plugin);

			new Notice("Generating...");
			let questions = await generator.generateQuestions(await loadNoteContents());
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
					setNotePaths(notePaths => notePaths.filter(element => element !== selectedNote.path));
					await showNoteAdder();
					const noteContents = cleanUpString(await app.vault.cachedRead(selectedNote));
					setSelectedNotes(new Map<string, string>(selectedNotes.set(selectedNote.path, noteContents)));
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
					setFolderPaths(folderPaths => folderPaths.filter(element => element !== selectedFolder.path));
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

					setSelectedNotes(selectedNotes => new Map<string, string>(selectedNotes).set(selectedFolder.path, folderContents.join(" ")));
					await displayFolder(selectedFolder);
				}
			});

			modal.open();
		}
	};

	const displayNote = async (note: TFile): Promise<void> => {
		setClearButtonDisabled(false);
		setGenerateButtonDisabled(false);
		const noteTokens = await countNoteTokens(selectedNotes.get(note.path));

		await addNoteContainer(note, noteTokens);

		setPromptTokens(promptTokens + noteTokens);
		// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this
	};

	const displayFolder = async (folder: TFolder): Promise<void> => {
		setClearButtonDisabled(false);
		setGenerateButtonDisabled(false);
		const noteTokens = await countNoteTokens(selectedNotes.get(folder.path));

		await addFolderContainer(folder, noteTokens);

		setPromptTokens(promptTokens + noteTokens);
		// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this
	};

	const addNoteContainer = async (note: TFile, tokens: number): Promise<void> => {
		const key = new Date().getTime().toString();

		const removeListener = async (): Promise<void> => {
			const updatedSelectedNotes = new Map<string, string>(selectedNotes);
			updatedSelectedNotes.delete(note.path);
			setSelectedNotes(new Map<string, string>(updatedSelectedNotes));

			setNotesContainerChildren(notesContainerChildren => notesContainerChildren.filter(child => child.key !== key));

			const updatedNotePaths = [...notePaths, note.path];
			setNotePaths(updatedNotePaths);
			setPromptTokens(promptTokens - tokens);
			// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this

			if (selectedNotes.size === 0) {
				setClearButtonDisabled(true);
				setGenerateButtonDisabled(true);
			}
		};

		const newNoteContainer = <NoteContainer showPath={plugin.settings.showNotePath} path={note.path} basename={note.basename} tokens={tokens} onClick={removeListener} key={key}></NoteContainer>;
		setNotesContainerChildren(notesContainerChildren => [...notesContainerChildren, newNoteContainer]);
	};

	const addFolderContainer = async (folder: TFolder, tokens: number): Promise<void> => {
		const key = new Date().getTime().toString();

		const removeListener = async (): Promise<void> => {
			const updatedSelectedNotes = new Map<string, string>(selectedNotes);
			updatedSelectedNotes.delete(folder.path);
			setSelectedNotes(updatedSelectedNotes);

			setNotesContainerChildren(notesContainerChildren => notesContainerChildren.filter(child => child.key !== key));

			const updatedFolderPaths = [...folderPaths, folder.path];
			setFolderPaths(updatedFolderPaths);
			setPromptTokens(promptTokens - tokens);
			// this.tokenSection.textContent = "Prompt tokens: " + this.promptTokens; might not need this

			if (selectedNotes.size === 0) {
				setClearButtonDisabled(true);
				setGenerateButtonDisabled(true);
			}
		};

		if (folder.path === "/") {
			const newFolderContainer = <FolderContainer showPath={true} path={app.vault.getName() + " (Vault)"} basename={folder.name} tokens={tokens} onClick={removeListener} key={key}></FolderContainer>;
			setNotesContainerChildren(notesContainerChildren => [...notesContainerChildren, newFolderContainer]);
		} else {
			const newFolderContainer = <FolderContainer showPath={plugin.settings.showFolderPath} path={folder.path} basename={folder.name} tokens={tokens} onClick={removeListener} key={key}></FolderContainer>;
			setNotesContainerChildren(notesContainerChildren => [...notesContainerChildren, newFolderContainer]);
		}
	};

	const countNoteTokens = async (noteContents: string | undefined): Promise<number> => {
		if (typeof noteContents === "string") {
			return Math.round(noteContents.length / 4);
		} else {
			return 0;
		}
	};

	const loadNoteContents = async (): Promise<string[]> => {
		const noteContents: string[] = [];

		for (const noteContent of selectedNotes.values()) {
			noteContents.push(noteContent);
		}

		return noteContents;
	};

	return (
		<>
			<div className={"modal-bg"} style={{opacity: 0.85}}></div>
			<div ref={modalRef} className={"modal modal-el-container"}>
				<div className={"modal-close-button"} onClick={close}></div>
				<div className={"modal-title title-style"}>Selected Notes</div>
				<div className={"modal-content modal-content-container"}>
					<div className={"notes-container"}>
						{notesContainerChildren}
					</div>
					<span className={"token-container"}>Prompt tokens: {promptTokens}</span>
					<div className={"selector-button-container"}>
						<SelectorButton icon={"book-x"} toolTip={"Remove all"} onClick={clearListener} isDisabled={clearButtonDisabled}></SelectorButton>
						<SelectorButton icon={"scroll-text"} toolTip={"Open quiz"} onClick={quizListener} isDisabled={quizButtonDisabled}></SelectorButton>
						<SelectorButton icon={"file-plus-2"} toolTip={"Add note"} onClick={addNoteListener} isDisabled={false}></SelectorButton>
						<SelectorButton icon={"folder-plus"} toolTip={"Add folder"} onClick={addFolderListener} isDisabled={false}></SelectorButton>
						<SelectorButton icon={"webhook"} toolTip={"Generate"} onClick={generateListener} isDisabled={generateButtonDisabled}></SelectorButton>
					</div>
				</div>
			</div>
		</>
	);
};

export default SelectorModal;
