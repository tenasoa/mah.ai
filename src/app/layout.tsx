import { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { PersistentLayout } from "@/components/layout/PersistentLayout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

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
    <html lang="fr" className="font-outfit font-inter" suppressHydrationWarning>
      <body className="font-inter" suppressHydrationWarning>
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
