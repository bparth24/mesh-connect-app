import React, { useEffect } from "react";
import { ModalBackground, ModalContent, CloseButton } from "./StyledComponents";

/**
 * Props for the ErrorModal component.
 *
 * @interface ErrorModalProps
 * @property {string | object} message - The error message to display. Can be a string or an object.
 * @property {() => void} onClose - Callback function to handle the closing of the modal.
 */
interface ErrorModalProps {
  message: string | object;
  onClose: () => void;
}

/**
 * ErrorModal component displays an error message in a modal dialog.
 * The modal automatically closes after 5 seconds or when the close button is clicked.
 *
 * @component
 * @param {ErrorModalProps} props - The props for the ErrorModal component.
 * @param {string | object} props.message - The error message to display. Can be a string or an object.
 * @param {() => void} props.onClose - The function to call when the modal is closed.
 *
 * @example
 * <ErrorModal message="An error occurred" onClose={handleClose} />
 *
 * @example
 * <ErrorModal message={{ code: 500, message: "Internal Server Error" }} onClose={handleClose} />
 */
const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <ModalBackground>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {typeof message === "string" ? (
          <p>{message}</p>
        ) : (
          <pre>{JSON.stringify(message, null, 2)}</pre>
        )}
      </ModalContent>
    </ModalBackground>
  );
};

export default ErrorModal;
