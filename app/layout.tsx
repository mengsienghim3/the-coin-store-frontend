import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

import { LanguageProvider } from "../context/language-context";

export const metadata: Metadata = {
  title: "The Coin Store | Game Diamonds & Digital Gift Cards (Cambodia)",
  description:
    "Official top-up center for Mobile Legends, Free Fire, PUBG Mobile, Telegram Premium and Digital Gift Cards with instant ABA Pay delivery in Cambodia.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <Script
          src="https://checkout.payway.com.kh/plugins/checkout2-0.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="font-sans antialiased bg-[#090a0f] text-slate-100 min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
