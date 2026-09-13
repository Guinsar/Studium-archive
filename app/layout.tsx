import type { Metadata } from "next";
import Link from "next/link";
import { Library, Upload, FolderOpen, Bookmark, ScrollText, ShieldCheck, LogIn, Info } from "lucide-react";
import BasculeTheme from "@/components/BasculeTheme";
import TransitionPage from "@/components/TransitionPage";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studium Archive — Faculté de Droit, UFHB",
  description:
    "Dépôt et consultation des mémoires, exposés et dissertations de la filière Droit à l'UFHB.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1C2B3A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-parchment font-sans text-charcoal">
        <header className="border-b border-rule">
          <div className="h-1 bg-gradient-to-r from-wine via-gold to-sage" />
          <div className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-4 px-6 py-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-serif text-xl text-ink transition-colors duration-200 hover:text-wine"
            >
              <Library size={22} strokeWidth={1.5} />
              Studium Archive
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link href="/" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <Library size={16} strokeWidth={1.5} />
                Consulter
              </Link>
              <Link href="/deposer" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <Upload size={16} strokeWidth={1.5} />
                Déposer un travail
              </Link>
              <Link href="/profil" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <FolderOpen size={16} strokeWidth={1.5} />
                Mes dépôts
              </Link>
              <Link href="/favoris" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <Bookmark size={16} strokeWidth={1.5} />
                Favoris
              </Link>
              <Link href="/charte" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <ScrollText size={16} strokeWidth={1.5} />
                Charte
              </Link>
              <Link href="/moderation" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <ShieldCheck size={16} strokeWidth={1.5} />
                Modération
              </Link>
              <Link href="/connexion" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
                <LogIn size={16} strokeWidth={1.5} />
                Connexion
              </Link>
              <BasculeTheme />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">
          <TransitionPage>{children}</TransitionPage>
        </main>
        <footer className="mt-16 border-t border-rule">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-6 text-sm text-charcoal/60">
            <span>Université Félix Houphouët-Boigny de Cocody — Filière Droit</span>
            <Link href="/a-propos" className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine">
              <Info size={16} strokeWidth={1.5} />
              À propos
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
