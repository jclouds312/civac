import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initProtection } from "./lib/protection";

initProtection();

createRoot(document.getElementById("root")!).render(<App />);
