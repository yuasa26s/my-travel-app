import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-white">
        <header className="p-6 text-lg font-semibold text-gray-700">
          ✈️ Travel App
        </header>
        <main className="px-6 pb-16">{children}</main>
      </body>
    </html>
  );
}
