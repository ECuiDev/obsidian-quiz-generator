import { App } from "obsidian";
import SelectorModal from "./SelectorModal";
import React from "react";
import { QuizSettings } from "../utils/types";

interface SelectorModalWrapperProps {
	app: App;
	settings: QuizSettings;
	parent: HTMLDivElement;
}

const SelectorModalWrapper: React.FC<SelectorModalWrapperProps> = ({ app, settings, parent }) => {
	return(
		<SelectorModal app={app} settings={settings} parent={parent}></SelectorModal>
	);
}

export default SelectorModalWrapper;
