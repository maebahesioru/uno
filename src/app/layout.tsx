import type { Metadata } from "next";
import "./globals.css";

// rebuild trigger
export const metadata: Metadata = {
  metadataBase: new URL("https://uno.hikamer.f5.si"),
  title: "UNO ゲーム",
  description: "AIと対戦できるUNOゲーム",
  openGraph: {
    title: "UNO ゲーム",
    description: "AIと対戦できるUNOゲーム",
    type: "website",
    locale: "ja_JP",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "UNO ゲーム",
    description: "AIと対戦できるUNOゲーム",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
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
