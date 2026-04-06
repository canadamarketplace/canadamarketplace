import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#dc2626",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.canadamarketplace.ca"),
  title: "Canada Marketplace — Buy & Sell Across Canada",
  description: "Canada's most trusted marketplace. Escrow protection, verified sellers, and all transactions in CAD. Built safe by design.",
  keywords: ["Canada", "marketplace", "buy", "sell", "Canadian", "escrow", "verified sellers", "CAD", "e-commerce"],
  authors: [{ name: "Canada Marketplace" }],
  category: "e-commerce",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CAMarket",
  },
  alternates: {
    canonical: "https://www.canadamarketplace.ca",
    languages: {
      en: "https://www.canadamarketplace.ca",
      fr: "https://www.canadamarketplace.ca/fr",
    },
  },
  verification: {},
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Canada Marketplace — Buy & Sell Across Canada",
    description: "Canada's most trusted marketplace with escrow protection and verified sellers.",
    type: "website",
    siteName: "Canada Marketplace",
    locale: "en_CA",
    url: "https://www.canadamarketplace.ca",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Canada Marketplace — Buy & Sell Across Canada",
    description: "Canada's most trusted marketplace with escrow protection and verified sellers.",
    images: ["/logo.png"],
    creator: "@canadamarket",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Canada Marketplace",
    "application-name": "Canada Marketplace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#dc2626" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CAMarket" />
        <meta name="application-name" content="Canada Marketplace" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
      </head>
      <ThemeProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cm-bg text-cm-primary`}
        >
          {children}
          <Toaster />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    }).catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                  });
                }
              `,
            }}
          />
        </body>
      </ThemeProvider>
    </html>
  );
}
