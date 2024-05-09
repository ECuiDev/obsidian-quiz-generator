import React, { useEffect, useRef } from 'react';
import { setIcon, setTooltip } from "obsidian";

interface RemoveButtonProps {
	onClick: () => Promise<void>
}

const RemoveButton = ({ onClick }: RemoveButtonProps) => {
	const buttonRef = useRef(null);

	useEffect(() => {
		if (buttonRef.current) {
			setIcon(buttonRef.current, "x");
			setTooltip(buttonRef.current, "Remove");
		}
	}, []);

	return (
		<button ref={buttonRef} className="remove-button" onClick={onClick}></button>
	);
};

export default RemoveButton;
