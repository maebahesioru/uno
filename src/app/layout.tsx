import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UNO ゲーム",
  description: "AIと対戦できるUNOゲーム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}
      </body>
    </html>
  );
}
