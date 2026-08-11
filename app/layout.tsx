import type { Metadata } from "next";
import "../artifacts/ganader-ia/src/index.css";

export const metadata: Metadata = {
  title: "CIVAC — Ganadería Inteligente",
  description: "Control inteligente de valor agropecuario para Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}