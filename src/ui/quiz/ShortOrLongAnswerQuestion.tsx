import { App, Component, MarkdownRenderer, Notice } from "obsidian";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShortOrLongAnswer } from "../../utils/types";
import { QuizSettings } from "../../settings/config";
import GeneratorFactory from "../../generators/generatorFactory";
import AnswerInput from "../components/AnswerInput";

interface ShortOrLongAnswerQuestionProps {
	app: App;
	question: ShortOrLongAnswer;
	settings: QuizSettings;
}

const ShortOrLongAnswerQuestion = ({ app, question, settings }: ShortOrLongAnswerQuestionProps) => {
	const [status, setStatus] = useState<"answering" | "evaluating" | "submitted">("answering");
	const component = useMemo<Component>(() => new Component(), []);
	const questionRef = useRef<HTMLDivElement>(null);
	const answerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		question.question.split("\\n").forEach(questionFragment => {
			if (questionRef.current) {
				MarkdownRenderer.render(app, questionFragment, questionRef.current, "", component);
			}
		});
	}, [app, question, component]);

	useEffect(() => {
		if (answerRef.current && status === "submitted") {
			MarkdownRenderer.render(app, question.answer, answerRef.current, "", component);
		}
	}, [app, question, component, status]);

	const handleSubmit = async (input: string) => {
		if (input.toLowerCase().trim() === "skip") {
			setStatus("submitted");
			return;
		}

		try {
			setStatus("evaluating");
			new Notice("Evaluating answer...");
			const generator = GeneratorFactory.createInstance(settings);
			const similarity = await generator.shortOrLongAnswerSimilarity(input.trim(), question.answer);
			const similarityPercentage = Math.round(similarity * 100);
			if (similarityPercentage >= 80) {
				new Notice(`Correct: ${similarityPercentage}% match`);
			} else {
				new Notice(`Incorrect: ${similarityPercentage}% match`);
			}
			setStatus("submitted");
		} catch (error) {
			setStatus("answering");
			new Notice((error as Error).message, 0);
		}
	};

	return (
		<div className="question-container-qg">
			<div className="question-qg" ref={questionRef} />
			{status === "submitted" && <button className="answer-qg" ref={answerRef} />}
			<div className={status === "submitted" ? "input-container-qg" : "input-container-qg limit-height-qg"}>
				<AnswerInput onSubmit={handleSubmit} clearInputOnSubmit={false} disabled={status !== "answering"} />
				<div className="instruction-footnote-qg">
					Press enter to submit your answer. Enter "skip" to reveal the answer.
				</div>
			</div>
		</div>
	);
};

export default ShortOrLongAnswerQuestion;
