import { App, Plugin } from "obsidian";
import QuizUI from "./ui/quizUI";

export default class QuizGenerator extends Plugin {
	async onload() {
		this.addCommand({
			id: "open-generator-gui",
			name: "Open Generator GUI",
			callback: () => {
				new QuizUI(this.app).open();
			},
		});
	}

}
