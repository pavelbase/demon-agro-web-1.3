import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Démon agro - pH Management a Výživa Půdy",
  description: "Komplexní řešení pro zdravou a výnosnou půdu. pH management, výživa půdy a GPS mapování pro zemědělce v západních, severních a středních Čechách.",
  keywords: "pH půdy, vápnění, analýza půdy, GPS mapování, zemědělství, draslík, síra, hořčík",
  icons: {
    icon: '/logo/demon-agro-favicon.svg',
  },
};

// Blokující skript – nastaví zmenšení portálu (viz globals.css) ještě před
// prvním vykreslením stránky, aby při refreshi/přímém načtení /portal/*
// nedocházelo k viditelnému "skoku" z původní na zmenšenou velikost.
// Seznam veřejných cest musí odpovídat `publicRoutes` v middleware.ts.
const PORTAL_SCALE_SCRIPT = `(function(){try{var p=window.location.pathname;var pub=['/portal','/portal/prihlaseni','/portal/reset-hesla','/portal/onboarding'];if(p.indexOf('/portal')===0&&pub.indexOf(p)===-1){document.documentElement.classList.add('portal-scale-90');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <script dangerouslySetInnerHTML={{ __html: PORTAL_SCALE_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
