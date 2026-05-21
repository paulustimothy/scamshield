import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityProvider } from "@/components/shared/AccessibilityProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScamShield — Lindungi Keluarga dari Penipuan Online",
  description:
    "AI yang membantu mendeteksi penipuan online, phishing, dan pesan manipulatif untuk melindungi Anda dan keluarga. Powered by Google Gemini AI.",
  keywords: [
    "scam detector",
    "penipuan online",
    "phishing",
    "AI",
    "keamanan siber",
    "Indonesia",
    "QRIS scam",
    "WhatsApp scam",
  ],
  openGraph: {
    title: "ScamShield — Lindungi Keluarga dari Penipuan Online",
    description:
      "AI yang membantu mendeteksi penipuan online, phishing, dan pesan manipulatif.",
    type: "website",
    locale: "id_ID",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0e1a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <AccessibilityProvider>
          <TooltipProvider>
            <div className="mesh-gradient" aria-hidden="true" />
            {children}
          </TooltipProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
