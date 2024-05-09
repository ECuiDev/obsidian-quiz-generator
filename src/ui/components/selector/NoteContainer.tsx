import React from "react";
import RemoveButton from "./buttons/RemoveButton";

interface NoteContainerProps {
	showPath: boolean;
	path: string;
	basename: string;
	tokens: number;
	onClick: () => Promise<void>;
}
// Refactor into single file/component with FolderContainer?
const NoteContainer: React.FC<NoteContainerProps> = ({ showPath, path, basename, tokens, onClick }) => {
	return (
		<div className={"notes-container-element"}>
			{showPath ? path : basename}
			<div className={"note-tokens"}>{tokens} tokens</div>
			<RemoveButton onClick={onClick}></RemoveButton>
		</div>
	);
}

export default NoteContainer;
