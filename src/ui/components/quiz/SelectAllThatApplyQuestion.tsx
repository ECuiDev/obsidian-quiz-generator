import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useMemo, useRef, useState } from "react";
import { SelectAllThatApply } from "../../../utils/types";

interface SelectAllThatApplyQuestionProps {
	app: App;
	question: SelectAllThatApply;
}

const SelectAllThatApplyQuestion = ({ app, question }: SelectAllThatApplyQuestionProps) => {
	const [userAnswer, setUserAnswer] = useState<number[]>([]);
	const [submitted, setSubmitted] = useState<boolean>(false);
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

	const toggleSelection = (buttonAnswer: number) => {
		setUserAnswer(prevUserAnswer => {
			if (prevUserAnswer.includes(buttonAnswer)) {
				return prevUserAnswer.filter(answer => answer !== buttonAnswer);
			} else {
				return [...prevUserAnswer, buttonAnswer];
			}
		});
	};

	const getButtonClass = (buttonAnswer: number): string | undefined => {
		if (submitted) {
			const correct = question.answer.includes(buttonAnswer);
			const selected = userAnswer.includes(buttonAnswer);
			if (correct && selected) return "select-all-that-apply-button correct-choice-qg";
			if (correct) return "select-all-that-apply-button correct-choice-qg not-selected-qg";
			if (selected) return "select-all-that-apply-button incorrect-choice-qg";
		} else if (userAnswer.includes(buttonAnswer)) {
			return "select-all-that-apply-button selected-choice-qg";
		}
		return "select-all-that-apply-button";
	};

	return (
		<div>
			<div className="question-qg" ref={questionRef} />
			<div className="select-all-that-apply-container-qg">
				{question.options.map((_, index) => (
					<button
						key={index}
						ref={(el) => buttonRefs.current[index] = el}
						className={getButtonClass(index)}
						onClick={() => toggleSelection(index)}
						disabled={submitted}
					/>
				))}
			</div>
			<button
				className="submit-answer-qg"
				onClick={() => setSubmitted(true)}
				disabled={!userAnswer.length || submitted}
			>
				Submit
			</button>
		</div>
	);
};

export default SelectAllThatApplyQuestion;
