import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dawbastion Vulnerability Analysis",
  description: "AI-powered vulnerability detection and analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased" style={{ background: "var(--ar-bg)" }}>
        {children}
      </body>
    </html>
  );
}
