import React, { useEffect } from "react";
import { ModalBackground, ModalContent, CloseButton } from "./StyledComponents";

/**
 * Props for the SuccessModal component.
 *
 * @interface SuccessModalProps
 * @property {string} message - The success message to display in the modal.
 * @property {() => void} onClose - Callback function to handle the closing of the modal.
 */
interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

/**
 * SuccessModal component displays a modal with a success message and automatically closes after 5 seconds.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.message - The success message to display in the modal.
 * @param {function} props.onClose - The function to call when the modal is closed.
 *
 * @example
 * <SuccessModal message="Operation successful!" onClose={handleClose} />
 */
const SuccessModal: React.FC<SuccessModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ModalBackground>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <pre>{message}</pre>
      </ModalContent>
    </ModalBackground>
  );
};

export default SuccessModal;
