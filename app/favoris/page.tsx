"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, BookOpen, Presentation, FileText, GraduationCap, Loader2 } from "lucide-react";
import { supabase, Travail } from "@/lib/supabase";

const LABELS_TYPE: Record<Travail["type_travail"], string> = {
  memoire: "Mémoire",
  expose: "Exposé",
  dissertation: "Dissertation",
  these: "Thèse",
};

const ICONES_TYPE: Record<Travail["type_travail"], typeof BookOpen> = {
  memoire: BookOpen,
  expose: Presentation,
  dissertation: FileText,
  these: GraduationCap,
};

export default function Favoris() {
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const [travaux, setTravaux] = useState<Travail[]>([]);

  useEffect(() => {
    const charger = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setConnecte(false);
        return;
      }
      setConnecte(true);

      const { data: favoris } = await supabase
        .from("favoris")
        .select("travail_id")
        .eq("user_id", user.id);

      const ids = (favoris ?? []).map((f) => f.travail_id);
      if (ids.length === 0) {
        setTravaux([]);
        return;
      }

      const { data } = await supabase.from("travaux").select("*").in("id", ids);
      setTravaux(data ?? []);
    };
    charger();
  }, []);

  if (connecte === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-charcoal/60">
        <Loader2 size={14} className="animate-spin" />
        Vérification en cours.
      </p>
    );
  }

  if (connecte === false) {
    return <p className="text-sm text-charcoal/60">Connecte-toi pour voir tes favoris.</p>;
  }

  return (
    <div>
      <h1 className="flex items-center gap-3 font-serif text-3xl text-ink">
        <Bookmark size={26} strokeWidth={1.5} className="text-gold" />
        Mes favoris
      </h1>

      {travaux.length === 0 && (
        <p className="mt-8 max-w-prose text-sm text-charcoal/80">
          Aucun travail mis de côté pour l'instant. Le petit marque-page sur
          chaque fiche te permet d'en garder un pour plus tard.
        </p>
      )}

      <ul className="mt-8 divide-y divide-rule">
        {travaux.map((travail) => {
          const Icone = ICONES_TYPE[travail.type_travail];
          return (
            <li key={travail.id} className="animate-apparition">
              <Link
                href={`/document/${travail.id}`}
                className="group -mx-3 flex gap-4 rounded-sm px-3 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-md"
              >
                <Icone size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-sage" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-serif text-lg text-ink transition-colors duration-200 group-hover:text-wine">
                      {travail.titre}
                    </h2>
                    <span className="shrink-0 text-sm text-charcoal/60">{travail.annee}</span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/70">
                    {LABELS_TYPE[travail.type_travail]} — {travail.auteur}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
