"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArchiveX, Loader2 } from "lucide-react";
import { supabase, Travail } from "@/lib/supabase";

const LABELS_TYPE: Record<Travail["type_travail"], string> = {
  memoire: "Mémoire",
  expose: "Exposé",
  dissertation: "Dissertation",
  these: "Thèse",
};

const LABELS_STATUT: Record<Travail["statut"], string> = {
  en_attente: "En attente de validation",
  publie: "Publié",
  refuse: "Refusé",
  retire: "Retiré",
};

const STYLES_STATUT: Record<Travail["statut"], string> = {
  en_attente: "text-charcoal/60",
  publie: "text-sage",
  refuse: "text-wine",
  retire: "text-charcoal/40",
};

const ICONES_STATUT: Record<Travail["statut"], typeof Clock> = {
  en_attente: Clock,
  publie: CheckCircle2,
  refuse: XCircle,
  retire: ArchiveX,
};

export default function Profil() {
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

      const { data } = await supabase
        .from("travaux")
        .select("*")
        .eq("depose_par", user.id)
        .order("cree_le", { ascending: false });

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
    return (
      <p className="text-sm text-charcoal/60">
        Connecte-toi pour voir tes dépôts.
      </p>
    );
  }

  return (
    <div className="animate-apparition">
      <h1 className="font-serif text-3xl text-ink">Mes dépôts</h1>

      {travaux.length === 0 && (
        <div className="animate-apparition py-8 text-center">
          <svg viewBox="0 0 160 100" className="mx-auto h-20 w-auto" aria-hidden="true">
            <rect x="30" y="55" width="100" height="8" rx="2" fill="#1C2B3A" />
            <rect x="45" y="30" width="70" height="25" rx="2" fill="#FBF8F1" stroke="#D8CFBC" strokeWidth="1.5" />
            <path d="M55 38 L105 38 M55 45 L95 45" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
            <circle cx="80" cy="30" r="3" fill="#B98A3D" />
          </svg>
          <p className="mt-4 max-w-prose text-sm text-charcoal/80">
            Tu n'as encore rien déposé.{" "}
            <Link href="/deposer" className="text-wine underline">
              Déposer un premier travail
            </Link>
            .
          </p>
        </div>
      )}

      <ul className="mt-8 divide-y divide-rule">
        {travaux.map((travail) => {
          const IconeStatut = ICONES_STATUT[travail.statut];
          return (
            <li key={travail.id} className="animate-apparition">
              <Link
                href={`/document/${travail.id}`}
                className="group -mx-3 flex items-baseline justify-between gap-4 rounded-sm px-3 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-md"
              >
                <div>
                  <h2 className="font-serif text-lg text-ink transition-colors duration-200 group-hover:text-wine">
                    {travail.titre}
                  </h2>
                  <p className="mt-1 text-sm text-charcoal/70">
                    {LABELS_TYPE[travail.type_travail]} — {travail.annee}
                  </p>
                </div>
                <span className={`flex shrink-0 items-center gap-1.5 text-sm ${STYLES_STATUT[travail.statut]}`}>
                  <IconeStatut size={15} strokeWidth={1.5} />
                  {LABELS_STATUT[travail.statut]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
