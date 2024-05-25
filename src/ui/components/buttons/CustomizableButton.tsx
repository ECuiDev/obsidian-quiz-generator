import React, { useEffect, useRef } from "react";
import { setIcon, setTooltip } from "obsidian";

interface CustomizableButtonProps {
	icon: string;
	toolTip: string;
	onClick: () => Promise<void>;
	isDisabled: boolean;
}

const CustomizableButton = ({ icon, toolTip, onClick, isDisabled }: CustomizableButtonProps) => {
	const buttonRef = useRef(null);

	useEffect(() => {
		if (buttonRef.current) {
			setIcon(buttonRef.current, icon);
			setTooltip(buttonRef.current, toolTip);
		}
	}, []);

	return (
		<button ref={buttonRef} className="ui-button" onClick={onClick} disabled={isDisabled}></button>
	);
};

export default CustomizableButton;
