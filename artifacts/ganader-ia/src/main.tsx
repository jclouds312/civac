import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import "./index.css";
import { initProtection } from "./lib/protection";
import { setBaseUrl } from "@workspace/api-client-react";

// En producción (Vercel u otro hosting), apuntar al API server desplegado.
// En desarrollo, el proxy de Vite en vite.config.ts maneja /api → localhost:8080.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

initProtection();

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SpeedInsights />
  </>,
);
