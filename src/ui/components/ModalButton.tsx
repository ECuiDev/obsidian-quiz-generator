import { useEffect, useRef } from "react";
import { setIcon, setTooltip } from "obsidian";

interface IconButtonProps {
	icon: string;
	toolTip: string;
	onClick: () => void;
	isDisabled?: boolean;
}

const ModalButton = ({ icon, toolTip, onClick, isDisabled = false }: IconButtonProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (buttonRef.current) {
			setIcon(buttonRef.current, icon);
			setTooltip(buttonRef.current, toolTip);
		}
	}, [icon, toolTip]);

	return <button className="modal-button-qg" onClick={onClick} disabled={isDisabled} ref={buttonRef} />;
};

export default ModalButton;
