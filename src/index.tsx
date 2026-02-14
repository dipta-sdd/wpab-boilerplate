import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import App from "./App";

const rootElement = document.getElementById("wpab-boilerplate");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
