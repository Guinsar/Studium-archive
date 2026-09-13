"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2, FileSearch } from "lucide-react";
import { supabase, Travail } from "@/lib/supabase";

const LABELS_TYPE: Record<Travail["type_travail"], string> = {
  memoire: "Mémoire",
  expose: "Exposé",
  dissertation: "Dissertation",
  these: "Thèse",
};

export default function Moderation() {
  const [autorise, setAutorise] = useState<boolean | null>(null);
  const [enAttente, setEnAttente] = useState<Travail[]>([]);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [enSortie, setEnSortie] = useState<Set<string>>(new Set());

  useEffect(() => {
    const verifierEtCharger = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAutorise(false);
        return;
      }

      const { data: moderateur } = await supabase
        .from("moderateurs")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!moderateur) {
        setAutorise(false);
        return;
      }

      setAutorise(true);
      await chargerEnAttente();
    };
    verifierEtCharger();
  }, []);

  const chargerEnAttente = async () => {
    const { data } = await supabase
      .from("travaux")
      .select("*")
      .eq("statut", "en_attente")
      .order("cree_le", { ascending: true });
    setEnAttente(data ?? []);
  };

  const traiter = (id: string, statut: "publie" | "refuse") => {
    setEnCours(id);
    setEnSortie((precedent) => new Set(precedent).add(id));

    setTimeout(async () => {
      await supabase.from("travaux").update({ statut }).eq("id", id);
      await chargerEnAttente();
      setEnSortie((precedent) => {
        const suivant = new Set(precedent);
        suivant.delete(id);
        return suivant;
      });
      setEnCours(null);
    }, 320);
  };

  if (autorise === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-charcoal/60">
        <Loader2 size={14} className="animate-spin" />
        Vérification en cours.
      </p>
    );
  }

  if (autorise === false) {
    return (
      <p className="text-sm text-charcoal/60">
        Cette page est réservée aux modérateurs. Connecte-toi avec un compte
        habilité pour y accéder.
      </p>
    );
  }

  return (
    <div className="animate-apparition">
      <h1 className="font-serif text-3xl text-ink">Dépôts en attente</h1>
      <p className="mt-3 max-w-prose text-charcoal/80">
        Chaque travail reste invisible aux autres étudiants tant qu'il n'a pas
        été validé ici.
      </p>

      {enAttente.length === 0 && (
        <p className="mt-8 text-sm text-charcoal/60">
          Aucun dépôt en attente pour le moment.
        </p>
      )}

      <ul className="mt-8 divide-y divide-rule">
        {enAttente.map((travail) => (
          <li
            key={travail.id}
            className={`animate-apparition py-6 transition-all duration-300 ${
              enSortie.has(travail.id) ? "-translate-x-4 opacity-0" : ""
            }`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-lg text-ink">{travail.titre}</h2>
              <span className="shrink-0 text-sm text-charcoal/60">
                {travail.annee}
              </span>
            </div>
            <p className="mt-1 text-sm text-charcoal/70">
              {LABELS_TYPE[travail.type_travail]} — {travail.auteur}
              {travail.matricule ? ` — matricule ${travail.matricule}` : " — matricule non renseigné"}
              {travail.encadrant ? ` — sous la direction de ${travail.encadrant}` : ""}
            </p>
            <p className="mt-2 text-sm text-charcoal/80">{travail.resume}</p>
            <a
              href={travail.fichier_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-wine underline"
            >
              <FileSearch size={14} strokeWidth={1.5} />
              Consulter le PDF avant de statuer
            </a>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => traiter(travail.id, "publie")}
                disabled={enCours === travail.id}
                className="bouton-principal py-2 text-sm disabled:opacity-50"
              >
                <Check size={16} strokeWidth={1.5} />
                Valider
              </button>
              <button
                onClick={() => traiter(travail.id, "refuse")}
                disabled={enCours === travail.id}
                className="bouton-discret py-2 text-sm disabled:opacity-50"
              >
                <X size={16} strokeWidth={1.5} />
                Refuser
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
