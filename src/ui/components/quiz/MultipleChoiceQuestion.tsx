import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useMemo, useRef, useState } from "react";
import { MultipleChoice } from "../../../utils/types";

interface MultipleChoiceQuestionProps {
	app: App;
	question: MultipleChoice;
}

const MultipleChoiceQuestion = ({ app, question }: MultipleChoiceQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<number | null>(null);
	const component = useMemo<Component>(() => new Component(), []);
	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		if (questionRef.current) {
			MarkdownRenderer.render(app, question.question, questionRef.current, "", component);
		}
		buttonRefs.current = buttonRefs.current.slice(0, question.options.length);
		buttonRefs.current.forEach((button, index) => {
			if (button) {
				MarkdownRenderer.render(app, question.options[index], button, "", component);
			}
		});
	}, [app, question, component]);

	const getButtonClass = (buttonAnswer: number): string | undefined => {
		if (userAnswer === null) return undefined;
		if (buttonAnswer === question.answer) return "correct-choice";
		if (buttonAnswer === userAnswer) return "incorrect-choice";
		return undefined;
	};

	return (
		<div className="question-container">
			<div className="question" ref={questionRef} />
			<div className="mc-tf-container">
				{question.options.map((_, index) => (
					<button
						key={index}
						ref={(el) => buttonRefs.current[index] = el}
						className={getButtonClass(index)}
						onClick={() => setUserAnswer(index)}
						disabled={userAnswer !== null}
					/>
				))}
			</div>
		</div>
	);
};

export default MultipleChoiceQuestion;
