import React, { FC } from "react";
import { Button, Modal } from "react-bootstrap";

type Props = {
  headerText?: string;
  confirmationText?: string;
  yesText?: string;
  noText?: string;
  disabled: boolean;
  close: () => void;
  onYes: () => void;
  onNo: () => void;
};

const ConfirmationModal: FC<Props> = ({
  headerText = "Are you sure you wish to continue?",
  confirmationText,
  yesText = "Confirm",
  noText = "Cancel",
  disabled,
  close,
  onYes,
  onNo,
}) => {
  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{headerText}</Modal.Title>
      </Modal.Header>
      {confirmationText ? <Modal.Body>{confirmationText}</Modal.Body> : null}
      <Modal.Footer>
        <Button variant="secondary" onClick={onNo} disabled={disabled}>
          {noText}
        </Button>
        <Button variant="primary" onClick={onYes} disabled={disabled}>
          {yesText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
