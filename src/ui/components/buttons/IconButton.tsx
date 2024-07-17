import { useEffect, useRef } from "react";
import { setIcon, setTooltip } from "obsidian";

interface IconButtonProps {
	icon: string;
	toolTip: string;
	onClick: () => void;
	isDisabled?: boolean;
}

const IconButton = ({ icon, toolTip, onClick, isDisabled = false }: IconButtonProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (buttonRef.current) {
			setIcon(buttonRef.current, icon);
			setTooltip(buttonRef.current, toolTip);
		}
	}, []);

	return <button className="ui-button" onClick={onClick} disabled={isDisabled} ref={buttonRef} />;
};

export default IconButton;
