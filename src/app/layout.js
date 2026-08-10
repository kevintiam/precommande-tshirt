import { Anton, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Anton ne se décline qu'en 400 : la graisse est dans le dessin.
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const TITRE = "Boutique officielle — Camp Impact ADN 2026";
const DESCRIPTION =
  "T-shirts et hoodies officiels du Camp Impact ADN, du 8 au 11 août 2026 au Centre COHERE. Précommande en ligne, paiement par virement Interac, retrait sur place.";

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  // Ce bloc est ce que Facebook, WhatsApp et iMessage affichent quand
  // quelqu'un partage le lien. Sans lui, ils bricolent un aperçu à partir
  // du HTML, souvent avec un texte tronqué.
  openGraph: {
    title: TITRE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_CA",
    siteName: "Camp Impact ADN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr-CA"
      className={`${inter.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
