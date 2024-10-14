import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useRef, useState } from "react";
import { MultipleChoice } from "../../utils/types";

interface MultipleChoiceQuestionProps {
	app: App;
	question: MultipleChoice;
}

const MultipleChoiceQuestion = ({ app, question }: MultipleChoiceQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<number | null>(null);
	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		const component = new Component();

		question.question.split("\\n").forEach(questionFragment => {
			if (questionRef.current) {
				MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
			}
		});

		buttonRefs.current = buttonRefs.current.slice(0, question.options.length);
		buttonRefs.current.forEach((button, index) => {
			if (button) {
				MarkdownRenderer.render(app, question.options[index], button, "", component);
			}
		});
	}, [app, question]);

	const getButtonClass = (buttonAnswer: number) => {
		if (userAnswer === null) return "multiple-choice-button-qg";
		const correct = buttonAnswer === question.answer;
		const selected = buttonAnswer === userAnswer;
		if (correct && selected) return "multiple-choice-button-qg correct-choice-qg";
		if (correct) return "multiple-choice-button-qg correct-choice-qg not-selected-qg";
		if (selected) return "multiple-choice-button-qg incorrect-choice-qg";
		return "multiple-choice-button-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="multiple-choice-container-qg">
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
