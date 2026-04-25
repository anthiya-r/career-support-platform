import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Resume Feedback Platform",
  description: "Simple MVP for resume submission and review feedback."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
