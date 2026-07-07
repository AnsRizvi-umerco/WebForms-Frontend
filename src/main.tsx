import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { applyDocumentLanguage, getStoredLanguage } from "./lib/i18n";

applyDocumentLanguage(getStoredLanguage());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
