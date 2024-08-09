import { useEffect, useRef } from "react";
import { setIconAndTooltip } from "../../utils/helpers";

interface ModalButtonProps {
	icon: string;
	tooltip: string;
	onClick: () => void;
	isDisabled?: boolean;
}

const ModalButton = ({ icon, tooltip, onClick, isDisabled = false }: ModalButtonProps) => {
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (buttonRef.current) {
			setIconAndTooltip(buttonRef.current, icon, tooltip);
		}
	}, [icon, tooltip]);

	return <button className="modal-button-qg" onClick={onClick} disabled={isDisabled} ref={buttonRef} />;
};

export default ModalButton;
