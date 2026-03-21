import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserva",
  description: "Prototype-aligned event reservation marketplace frontend",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
