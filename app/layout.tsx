import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "스킬투머니 · 원데이 강좌 플랫폼",
  description: "배운 기술이 돈이 되는 원데이 클래스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
