import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });

export const viewport: Viewport = { themeColor: "#0f0f0f" };

export const metadata: Metadata = {
  title: { default: "Merchant Portal — Qasar-e-Shehbala", template: "%s | Merchant Portal" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
