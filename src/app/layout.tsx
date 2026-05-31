import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });

const LOGO = "/logos/q-s-logo.jpeg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B5532A",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://admin.qasarshehbala.pk"),
  title: {
    default: "Merchant Portal — Qasar-e-Shehbala",
    template: "%s · Qasar-e-Shehbala Admin",
  },
  description: "Back-office portal for Qasar-e-Shehbala — manage products, orders, tailoring, customers, and more.",
  applicationName: "Qasar-e-Shehbala Admin",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: LOGO, type: "image/jpeg" }],
    shortcut: [{ url: LOGO }],
    apple: [{ url: LOGO }],
  },
  appleWebApp: { capable: true, title: "Qasar Admin", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  // Back-office must never be indexed
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  );
}
