import { App } from "obsidian";
import QuizGenerator from "../main";
import SelectorModal from "./SelectorModal";
import React from "react";

interface SelectorModalWrapperProps {
	app: App;
	plugin: QuizGenerator;
	parent: HTMLDivElement;
}

const SelectorModalWrapper: React.FC<SelectorModalWrapperProps> = ({ app, plugin, parent }) => {
	return(
		<SelectorModal app={app} plugin={plugin} parent={parent}></SelectorModal>
	);
}

export default SelectorModalWrapper;
