import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { PersistentLayout } from "@/components/layout/PersistentLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const calSans = localFont({
  src: [
    { path: "./fonts/CalSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/CalSans-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-calsans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mah.ai - Votre Tuteur IA Socratique",
  description: "Préparez vos examens avec l'excellence de l'IA communautaire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${calSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <PersistentLayout>{children}</PersistentLayout>
            </Suspense>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
