import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Démon agro - pH Management a Výživa Půdy",
  description: "Komplexní řešení pro zdravou a výnosnou půdu. pH management, výživa půdy a GPS mapování pro zemědělce v západních, severních a středních Čechách.",
  keywords: "pH půdy, vápnění, analýza půdy, GPS mapování, zemědělství, draslík, síra, hořčík",
  icons: {
    icon: '/logo/demon-agro-favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
