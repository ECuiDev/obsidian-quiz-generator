import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

interface AnswerInputProps {
	onSubmit: (input: string) => void;
	disabled?: boolean;
}

const AnswerInput = ({ onSubmit, disabled = false }: AnswerInputProps) => {
	const [userInput, setUserInput] = useState<string>("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setUserInput(event.target.value);
		if (inputRef.current) {
			inputRef.current.style.height = "auto";
			inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
		}
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			onSubmit(userInput);
			setUserInput("");
			if (inputRef.current) {
				inputRef.current.style.height = "auto";
			}
		}
	};

	return (
		<textarea
			className="text-area-input-qg"
			value={userInput}
			ref={inputRef}
			onChange={handleInputChange}
			onKeyDown={handleKeyDown}
			disabled={disabled}
			placeholder="Type your answer here..."
			rows={1}
		/>
	);
};

export default AnswerInput;
