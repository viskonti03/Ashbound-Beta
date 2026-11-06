import DanAttackPreview from "./animation/DanAttackPreview";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {["attacks","dan-strike"].includes(new URLSearchParams(location.search).get("preview") ?? "") ? <DanAttackPreview/> : <App />}
  </StrictMode>,
);
