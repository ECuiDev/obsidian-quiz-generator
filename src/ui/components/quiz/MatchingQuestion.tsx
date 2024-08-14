import { App, Component, MarkdownRenderer } from "obsidian";
import { useEffect, useMemo, useRef, useState } from "react";
import { Matching } from "../../../utils/types";
import { shuffleArray } from "../../../utils/helpers";

interface MatchingQuestionProps {
	app: App;
	question: Matching;
}

const MatchingQuestion = ({ app, question }: MatchingQuestionProps) => {
	const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
	const [selectedRight, setSelectedRight] = useState<number | null>(null);
	const [selectedPairs, setSelectedPairs] = useState<{ left: number, right: number }[]>([]);
	const [submitted, setSubmitted] = useState<boolean>(false);

	const leftOptions = useMemo<{ value: string, index: number }[]>(() =>
			shuffleArray(question.answer.map((pair, index) => ({ value: pair.leftOption, index }))),
		[question]
	);
	const rightOptions = useMemo<{ value: string, index: number }[]>(() =>
			shuffleArray(question.answer.map((pair, index) => ({ value: pair.rightOption, index }))),
		[question]
	);
	const correctPairsMap = useMemo<Map<number, number>>(() => {
		const leftIndexMap = new Map<string, number>(leftOptions.map((option, index) => [option.value, index]));
		const rightIndexMap = new Map<string, number>(rightOptions.map((option, index) => [option.value, index]));

		return question.answer.reduce((acc, pair) => {
			const leftIndex = leftIndexMap.get(pair.leftOption)!;
			const rightIndex = rightIndexMap.get(pair.rightOption)!;
			acc.set(leftIndex, rightIndex);
			return acc;
		}, new Map<number, number>());
	}, [question, leftOptions, rightOptions]);

	const component = useMemo<Component>(() => new Component(), []);
	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		if (questionRef.current) {
			MarkdownRenderer.render(app, question.question, questionRef.current, "", component);
		}
		buttonRefs.current = buttonRefs.current.slice(0, question.answer.length * 2);
		question.answer.forEach((_, index) => {
			const leftButton = buttonRefs.current[index * 2];
			const rightButton = buttonRefs.current[index * 2 + 1];
			if (leftButton) {
				MarkdownRenderer.render(app, leftOptions[index].value, leftButton, "", component);
			}
			if (rightButton) {
				MarkdownRenderer.render(app, rightOptions[index].value, rightButton, "", component);
			}
		});
	}, [app, question, component, leftOptions, rightOptions]);

	const handleLeftClick = (leftIndex: number) => {
		if (selectedLeft === leftIndex) {
			setSelectedLeft(null);
		} else if (selectedRight !== null) {
			const pairToReplace = selectedPairs.find(pair => pair.right === selectedRight);
			if (pairToReplace) {
				setSelectedPairs(selectedPairs.map(pair =>
					pair.right === selectedRight ? { left: leftIndex, right: selectedRight } : pair
				));
			} else {
				setSelectedPairs([...selectedPairs, { left: leftIndex, right: selectedRight }]);
			}
			setSelectedLeft(null);
			setSelectedRight(null);
		} else {
			setSelectedLeft(leftIndex);
		}
	};

	const handleRightClick = (rightIndex: number) => {
		if (selectedRight === rightIndex) {
			setSelectedRight(null);
		} else if (selectedLeft !== null) {
			const pairToReplace = selectedPairs.find(pair => pair.left === selectedLeft);
			if (pairToReplace) {
				setSelectedPairs(selectedPairs.map(pair =>
					pair.left === selectedLeft ? { left: selectedLeft, right: rightIndex } : pair
				));
			} else {
				setSelectedPairs([...selectedPairs, { left: selectedLeft, right: rightIndex }]);
			}
			setSelectedLeft(null);
			setSelectedRight(null);
		} else {
			setSelectedRight(rightIndex);
		}
	};

	const getLeftButtonClass = (leftIndex: number): string => {
		if (submitted) {
			const correctRightIndex = correctPairsMap.get(leftIndex);
			const isCorrectPair = selectedPairs.some(pair => pair.left === leftIndex && pair.right === correctRightIndex);
			return isCorrectPair ? "matching-button-qg correct-choice-qg" : "matching-button-qg incorrect-choice-qg";
		}

		if (selectedLeft === leftIndex || selectedPairs.some(pair => pair.left === leftIndex)) {
			return "matching-button-qg selected-choice-qg";
		}

		return "matching-button-qg";
	};

	const getRightButtonClass = (rightIndex: number): string => {
		if (submitted) {
			const leftIndex = selectedPairs.find(pair => pair.right === rightIndex)?.left;
			if (leftIndex !== undefined) {
				const correctRightIndex = correctPairsMap.get(leftIndex);
				return correctRightIndex === rightIndex
					? "matching-button-qg correct-choice-qg"
					: "matching-button-qg incorrect-choice-qg";
			}
		}

		if (selectedRight === rightIndex || selectedPairs.some(pair => pair.right === rightIndex)) {
			return "matching-button-qg selected-choice-qg";
		}

		return "matching-button-qg";
	};

	return (
		<div>
			<div className="question-qg" ref={questionRef} />
			<div className="matching-container-qg">
				{question.answer.map((_, index) => (
					<>
						<button
							key={`left-${index}`}
							ref={(el) => buttonRefs.current[index * 2] = el}
							className={getLeftButtonClass(index)}
							onClick={() => handleLeftClick(index)}
							disabled={submitted}
						/>
						<button
							key={`right-${index}`}
							ref={(el) => buttonRefs.current[index * 2 + 1] = el}
							className={getRightButtonClass(index)}
							onClick={() => handleRightClick(index)}
							disabled={submitted}
						/>
					</>
				))}
			</div>
			<button
				className="submit-answer-qg"
				onClick={() => setSubmitted(true)}
				disabled={selectedPairs.length !== question.answer.length}
			>
				Submit
			</button>
		</div>
	);
};

export default MatchingQuestion;
