import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans-khmer";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Coin Store | Bullion, Collectibles & Currencies",
  description:
    "Premium marketplace for gold, silver, rare numismatic coins, and collector items.",
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
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#090a0f] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
