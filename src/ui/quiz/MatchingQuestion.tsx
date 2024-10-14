import { App, Component, MarkdownRenderer } from "obsidian";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Matching } from "../../utils/types";
import { shuffleArray } from "../../utils/helpers";

interface MatchingQuestionProps {
	app: App;
	question: Matching;
}

const MatchingQuestion = ({ app, question }: MatchingQuestionProps) => {
	const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
	const [selectedRight, setSelectedRight] = useState<number | null>(null);
	const [selectedPairs, setSelectedPairs] = useState<{ leftIndex: number, rightIndex: number }[]>([]);
	const [status, setStatus] = useState<"answering" | "submitted" | "reviewing">("answering");

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

	const questionRef = useRef<HTMLDivElement>(null);
	const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		const component = new Component();

		question.question.split("\\n").forEach(questionFragment => {
			if (questionRef.current) {
				MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
			}
		});

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
	}, [app, question, leftOptions, rightOptions]);

	const handleLeftClick = (leftIndex: number) => {
		if (selectedLeft === leftIndex) {
			setSelectedLeft(null);
		} else if (selectedRight !== null) {
			const pairToReplace = selectedPairs.find(pair => pair.leftIndex === leftIndex);
			if (pairToReplace) {
				setSelectedPairs(selectedPairs.map(pair =>
					pair.rightIndex === pairToReplace.rightIndex ? { leftIndex: leftIndex, rightIndex: selectedRight } : pair
				));
			} else {
				setSelectedPairs([...selectedPairs, { leftIndex: leftIndex, rightIndex: selectedRight }]);
			}
			setSelectedLeft(null);
			setSelectedRight(null);
		} else if (!selectedPairs.some(pair => pair.leftIndex === leftIndex)) {
			setSelectedLeft(leftIndex);
		}
	};

	const handleRightClick = (rightIndex: number) => {
		if (selectedRight === rightIndex) {
			setSelectedRight(null);
		} else if (selectedLeft !== null) {
			const pairToReplace = selectedPairs.find(pair => pair.rightIndex === rightIndex);
			if (pairToReplace) {
				setSelectedPairs(selectedPairs.map(pair =>
					pair.leftIndex === pairToReplace.leftIndex ? { leftIndex: selectedLeft, rightIndex: rightIndex } : pair
				));
			} else {
				setSelectedPairs([...selectedPairs, { leftIndex: selectedLeft, rightIndex: rightIndex }]);
			}
			setSelectedLeft(null);
			setSelectedRight(null);
		} else if (!selectedPairs.some(pair => pair.rightIndex === rightIndex)) {
			setSelectedRight(rightIndex);
		}
	};

	const handleLeftDoubleClick = (leftIndex: number) => {
		setSelectedPairs(selectedPairs.filter(pair => pair.leftIndex !== leftIndex));
	};

	const handleRightDoubleClick = (rightIndex: number) => {
		setSelectedPairs(selectedPairs.filter(pair => pair.rightIndex !== rightIndex));
	};

	const getLeftButtonClass = (leftIndex: number): string => {
		if (status === "answering" &&
			(selectedLeft === leftIndex || selectedPairs.some(pair => pair.leftIndex === leftIndex))) {
			return "matching-button-qg selected-choice-qg";
		}

		if (status === "submitted") {
			const rightIndex = correctPairsMap.get(leftIndex);
			const correct = selectedPairs.some(pair => pair.leftIndex === leftIndex && pair.rightIndex === rightIndex);
			return correct ? "matching-button-qg correct-choice-qg" : "matching-button-qg incorrect-choice-qg";
		}

		if (status === "reviewing") {
			const rightIndex = correctPairsMap.get(leftIndex);
			const correct = selectedPairs.some(pair => pair.leftIndex === leftIndex && pair.rightIndex === rightIndex);
			return "matching-button-qg correct-choice-qg" + (correct ? "" : " not-selected-qg");
		}

		return "matching-button-qg";
	};

	const getRightButtonClass = (rightIndex: number): string => {
		if (status === "answering" &&
			(selectedRight === rightIndex || selectedPairs.some(pair => pair.rightIndex === rightIndex))) {
			return "matching-button-qg selected-choice-qg";
		}

		if (status === "submitted") {
			const leftIndex = selectedPairs.find(pair => pair.rightIndex === rightIndex)?.leftIndex;
			if (leftIndex !== undefined) {
				const correctRightIndex = correctPairsMap.get(leftIndex);
				return correctRightIndex === rightIndex
					? "matching-button-qg correct-choice-qg"
					: "matching-button-qg incorrect-choice-qg";
			}
		}

		if (status === "reviewing") {
			const leftIndex = selectedPairs.find(pair => pair.rightIndex === rightIndex)?.leftIndex;
			if (leftIndex !== undefined) {
				const correctRightIndex = correctPairsMap.get(leftIndex);
				return "matching-button-qg correct-choice-qg" + (correctRightIndex === rightIndex ? "" : " not-selected-qg");
			}
		}

		return "matching-button-qg";
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			<div className="matching-container-qg">
				{question.answer.map((_, index) => (
					<Fragment key={index}>
						<div className="matching-button-container-qg">
							<svg className="svg-left-qg" viewBox="0 0 40 40">
								<circle className="svg-circle-qg" cx="20" cy="20" r="18" />
								<text className="svg-circle-text-qg" x="20" y="26">
									{(() => {
										const pairIndex = status === "reviewing"
											? Array.from(correctPairsMap.keys()).findIndex(leftIndex => leftIndex === index)
											: selectedPairs.findIndex(pair => pair.leftIndex === index);
										return pairIndex === -1 ? "" : pairIndex + 1;
									})()}
								</text>
							</svg>
							<button
								ref={el => buttonRefs.current[index * 2] = el}
								className={getLeftButtonClass(index)}
								onClick={() => handleLeftClick(index)}
								onDoubleClick={() => handleLeftDoubleClick(index)}
								disabled={status !== "answering"}
							/>
						</div>
						<div className="matching-button-container-qg">
							<svg className="svg-right-qg" viewBox="0 0 40 40">
								<circle className="svg-circle-qg" cx="20" cy="20" r="18" />
								<text className="svg-circle-text-qg" x="20" y="26">
									{(() => {
										const pairIndex = status === "reviewing"
											? Array.from(correctPairsMap.values()).findIndex(rightIndex => rightIndex === index)
											: selectedPairs.findIndex(pair => pair.rightIndex === index);
										return pairIndex === -1 ? "" : pairIndex + 1;
									})()}
								</text>
							</svg>
							<button
								ref={(el) => buttonRefs.current[index * 2 + 1] = el}
								className={getRightButtonClass(index)}
								onClick={() => handleRightClick(index)}
								onDoubleClick={() => handleRightDoubleClick(index)}
								disabled={status !== "answering"}
							/>
						</div>
					</Fragment>
				))}
			</div>
			<button
				className="submit-answer-qg"
				onClick={() => setStatus(status === "answering" ? "submitted" : "reviewing")}
				disabled={
					selectedPairs.length !== question.answer.length ||
					status === "reviewing" ||
					!selectedPairs.some(pair => correctPairsMap.get(pair.leftIndex) !== pair.rightIndex) &&
					status !== "answering"
				}
			>
				{status === "answering" ? "Submit" : "Reveal answer"}
			</button>
		</div>
	);
};

export default MatchingQuestion;
