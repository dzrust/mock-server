import { faExclamationCircle } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../hooks";
import { NOTIFICATION_TYPE } from "../models/notification";
import { removeNotification } from "../slice/app-slice";

const NotificationDisplay: FC = () => {
  const notifications = useAppSelector((state) => state.app).notifications;
  const dispatch = useDispatch();
  return (
    <ToastContainer position="top-end" className="mt-5">
      {notifications.map((notification, index) => {
        if (notification.type === NOTIFICATION_TYPE.ERROR) {
          return (
            <Toast key={notification.id} bg="danger" onClose={() => dispatch(removeNotification(index))}>
              <Toast.Header>
                <FontAwesomeIcon className="me-1" icon={faExclamationCircle} />
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body>{notification.message}</Toast.Body>
            </Toast>
          );
        }
        return null;
      })}
    </ToastContainer>
  );
};

export default NotificationDisplay;
