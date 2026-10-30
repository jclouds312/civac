import { createRoot } from "react-dom/client";
import { injectSpeedInsights } from "@vercel/speed-insights";
import App from "./App";
import "./index.css";
import "./responsive.scss";
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
  <App />,
);

// This is a Vite/React SPA, not a Next.js app. The framework-agnostic API
// avoids adding another React runtime while still enabling Vercel metrics.
if (import.meta.env.PROD) {
  injectSpeedInsights({ framework: "react" });
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}
