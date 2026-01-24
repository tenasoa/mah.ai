import type { Metadata } from "next";
import "./globals.css";
import { PersistentLayout } from "@/components/layout/PersistentLayout";

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
        <PersistentLayout>{children}</PersistentLayout>
      </body>
    </html>
  );
}
