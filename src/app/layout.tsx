import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SKOUTEX | AI Agents for Football Intelligence",
  description: "AI Agents that accelerate football decision-making. Smarter transfers, faster.",
  keywords: ["football intelligence", "AI agents", "player analytics", "transfer market", "sporting director", "football AI", "decision-making"],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SKOUTEX | AI Agents for Football Intelligence",
    description: "AI Agents that accelerate football decision-making. Smarter transfers, faster.",
    type: "website",
    siteName: "SKOUTEX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SKOUTEX - AI Agents for Football Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SKOUTEX | AI Agents for Football Intelligence",
    description: "AI Agents that accelerate football decision-making. Smarter transfers, faster.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased overflow-x-hidden`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
