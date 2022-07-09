import { faExclamationCircle } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { FC } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";
import { setError } from "../slice/app-slice";

const Error: FC = () => {
  const error = useAppSelector((state) => state.app).error;
  const dispatch = useDispatch();
  if (!error) return null;
  return (
    <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 99999 }}>
      <Toast bg="danger" onClose={() => dispatch(setError(undefined))}>
        <Toast.Header>
          <FontAwesomeIcon className="me-1" icon={faExclamationCircle} />
          <strong className="me-auto">Error</strong>
        </Toast.Header>
        <Toast.Body>{error}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default Error;
