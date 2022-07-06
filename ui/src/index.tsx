import React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./app";

import "bootstrap/dist/css/bootstrap.min.css";

const appElement = document.getElementById("app");
if (appElement) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    appElement,
  );
} else {
  console.error("Base Element not found");
}
