import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "18px",
          background: "#102227",
          color: "#f7f9f8",
        },
      }}
    />
    <App />
  </React.StrictMode>,
);
