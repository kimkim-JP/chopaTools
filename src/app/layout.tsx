import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LINE Stamp Studio",
  description: "LINEスタンプ向け画像をAIで生成する制作ツール"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
