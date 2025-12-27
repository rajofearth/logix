import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({ variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logix | Advanced Fleet Telematics & Logistics Optimization",
  description: "Logix provides cutting-edge telematics solutions to optimize fleet efficiency, reduce costs by up to 27%, and ensure regulatory compliance with GPS tracking and AI-driven maintenance.",
  keywords: ["fleet management", "telematics", "logistics optimization", "GPS tracking", "predictive maintenance", "Logix"],
  openGraph: {
    title: "Logix | Advanced Fleet Telematics",
    description: "Optimize your fleet with Logix's AI-driven telematics solutions.",
    url: "https://logix.example.com",
    siteName: "Logix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logix | Advanced Fleet Telematics",
    description: "Optimize your fleet with Logix's AI-driven telematics solutions.",
  },
};

import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSans.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
