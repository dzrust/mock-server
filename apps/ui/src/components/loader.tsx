import { faSpinner } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";

import "../styles/loader.css";

const Loader: FC = () => {
  return (
    <div className="loader__container">
      <FontAwesomeIcon icon={faSpinner} spinPulse className="loader" />
    </div>
  );
};

export default Loader;
