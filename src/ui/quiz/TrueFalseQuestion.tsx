import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { TrueFalse } from "../../utils/types";

interface TrueFalseQuestionProps {
	app: App;
	question: TrueFalse;
}

const TrueFalseQuestion = ({ app, question }: TrueFalseQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
	const questionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const component = new Component();

		question.question.split("\\n").forEach(questionFragment => {
			if (questionRef.current) {
				MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
			}
		});
	}, [app, question]);

	const getButtonClass = (buttonAnswer: boolean) => {
		if (userAnswer === null) return "true-false-button-qg";
		const correct = buttonAnswer === question.answer;
		const selected = buttonAnswer === userAnswer;
		if (correct && selected) return "true-false-button-qg correct-choice-qg";
		if (correct) return "true-false-button-qg correct-choice-qg not-selected-qg";
		if (selected) return "true-false-button-qg incorrect-choice-qg";
		return "true-false-button-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="true-false-container-qg">
				<button
					className={getButtonClass(true)}
					onClick={() => setUserAnswer(true)}
					disabled={userAnswer !== null}
				>
					True
				</button>
				<button
					className={getButtonClass(false)}
					onClick={() => setUserAnswer(false)}
					disabled={userAnswer !== null}
				>
					False
				</button>
			</div>
		</div>
	);
};

export default TrueFalseQuestion;
