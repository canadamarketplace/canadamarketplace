import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canada Marketplace — Buy & Sell Across Canada",
  description: "Canada's most trusted marketplace. Escrow protection, verified sellers, and all transactions in CAD. Built safe by design.",
  keywords: ["Canada", "marketplace", "buy", "sell", "Canadian", "escrow", "verified sellers", "CAD", "e-commerce"],
  authors: [{ name: "Canada Marketplace" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍁</text></svg>",
  },
  openGraph: {
    title: "Canada Marketplace — Buy & Sell Across Canada",
    description: "Canada's most trusted marketplace with escrow protection and verified sellers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-stone-100`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
