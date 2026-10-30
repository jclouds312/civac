"use client";

import dynamic from "next/dynamic";

const CivacClientApp = dynamic(
  () => import("../artifacts/ganader-ia/src/App"),
  {
    ssr: false,
    loading: () => (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#06111f",
          color: "#00f5d4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Cargando CIVAC…
      </main>
    ),
  },
);

export default function CivacApp() {
  return <CivacClientApp />;
}