import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { TrueFalse } from "../../../utils/types";

interface TrueFalseQuestionProps {
	app: App;
	question: TrueFalse;
}

const TrueFalseQuestion = ({ app, question }: TrueFalseQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
	const questionRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (questionRef.current) {
			MarkdownRenderer.render(app, question.question, questionRef.current, "", new Component());
		}
	}, []);

	const getButtonClass = (buttonAnswer: boolean): string | undefined => {
		if (userAnswer === null) return undefined;
		if (buttonAnswer === question.answer) return "correct-choice";
		if (buttonAnswer === userAnswer) return "incorrect-choice";
		return undefined;
	};

	return (
		<div className="question-container">
			<div className="question" ref={questionRef} />
			<div className="mc-tf-container">
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
