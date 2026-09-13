"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Download, AlertTriangle, Loader2, Bookmark, Share2, Check } from "lucide-react";
import { supabase, Travail } from "@/lib/supabase";

const LABELS_TYPE: Record<Travail["type_travail"], string> = {
  memoire: "Mémoire",
  expose: "Exposé",
  dissertation: "Dissertation",
  these: "Thèse",
};

export default function FicheDocument() {
  const { id } = useParams<{ id: string }>();
  const [travail, setTravail] = useState<Travail | null>(null);
  const [introuvable, setIntrouvable] = useState(false);
  const [estAuteur, setEstAuteur] = useState(false);
  const [retraitEnCours, setRetraitEnCours] = useState(false);
  const [utilisateurId, setUtilisateurId] = useState<string | null>(null);
  const [enFavori, setEnFavori] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  const [progression, setProgression] = useState(0);

  useEffect(() => {
    const surDefilement = () => {
      const hauteurTotale = document.documentElement.scrollHeight - window.innerHeight;
      const pourcentage = hauteurTotale > 0 ? (window.scrollY / hauteurTotale) * 100 : 0;
      setProgression(Math.min(100, Math.max(0, pourcentage)));
    };
    window.addEventListener("scroll", surDefilement);
    return () => window.removeEventListener("scroll", surDefilement);
  }, []);

  useEffect(() => {
    const charger = async () => {
      const { data } = await supabase
        .from("travaux")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        setIntrouvable(true);
        return;
      }

      setTravail(data);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEstAuteur(user?.id === data.depose_par);
      setUtilisateurId(user?.id ?? null);

      if (user) {
        const { data: favori } = await supabase
          .from("favoris")
          .select("user_id")
          .eq("user_id", user.id)
          .eq("travail_id", id)
          .maybeSingle();
        setEnFavori(!!favori);
      }

      if (data.statut === "publie") {
        await supabase
          .from("travaux")
          .update({ consultations: data.consultations + 1 })
          .eq("id", id);
      }
    };
    charger();
  }, [id]);

  const retirer = async () => {
    if (!travail) return;
    setRetraitEnCours(true);
    await supabase.from("travaux").update({ statut: "retire" }).eq("id", travail.id);
    setTravail({ ...travail, statut: "retire" });
    setRetraitEnCours(false);
  };

  const enregistrerTelechargement = async () => {
    if (!travail) return;
    await supabase
      .from("travaux")
      .update({ telechargements: travail.telechargements + 1 })
      .eq("id", travail.id);
  };

  const basculerFavori = async () => {
    if (!utilisateurId || !travail) return;
    if (enFavori) {
      await supabase.from("favoris").delete().eq("user_id", utilisateurId).eq("travail_id", travail.id);
    } else {
      await supabase.from("favoris").insert({ user_id: utilisateurId, travail_id: travail.id });
    }
    setEnFavori(!enFavori);
  };

  const partager = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setLienCopie(true);
    setTimeout(() => setLienCopie(false), 2000);
  };

  if (introuvable) {
    return <p className="text-sm text-charcoal/60">Ce travail n'existe pas ou n'est plus disponible.</p>;
  }

  if (!travail) {
    return (
      <p className="flex items-center gap-2 text-sm text-charcoal/60">
        <Loader2 size={14} className="animate-spin" />
        Chargement en cours.
      </p>
    );
  }

  return (
    <div className="animate-apparition">
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-rule/40">
        <div
          className="h-full bg-gradient-to-r from-wine to-gold transition-[width] duration-150"
          style={{ width: `${progression}%` }}
        />
      </div>

      {estAuteur && travail.statut !== "retire" && (
        <div className="mb-6 flex animate-apparition items-start gap-3 rounded-sm border border-rule bg-surface/60 px-4 py-3 text-sm">
          <AlertTriangle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-sage" />
          <div>
            <p className="text-charcoal/80">
              C'est ton travail. Tu peux le retirer à tout moment, sans avoir à
              te justifier.
            </p>
            <button
              onClick={retirer}
              disabled={retraitEnCours}
              className="mt-2 rounded-sm border border-wine px-4 py-1 text-wine transition-colors duration-200 hover:bg-wine hover:text-parchment disabled:opacity-50"
            >
              {retraitEnCours ? "Retrait en cours" : "Retirer ce travail"}
            </button>
          </div>
        </div>
      )}

      {travail.statut === "retire" ? (
        <p className="max-w-prose text-charcoal/80">
          Ce travail a été retiré par son auteur. Il n'est plus consultable.
        </p>
      ) : (
        <div className="max-w-prose">
        <p className="text-sm text-charcoal/60">
          {LABELS_TYPE[travail.type_travail]} — {travail.annee}
        </p>
        <h1 className="mt-1 font-serif text-3xl text-ink">{travail.titre}</h1>

        <div className="mt-3 flex items-center gap-4">
          {utilisateurId && (
            <button
              onClick={basculerFavori}
              className="flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors duration-200 hover:text-gold"
            >
              <Bookmark size={16} strokeWidth={1.5} className={enFavori ? "fill-gold text-gold" : ""} />
              {enFavori ? "Dans tes favoris" : "Ajouter aux favoris"}
            </button>
          )}
          <button
            onClick={partager}
            className="flex items-center gap-1.5 text-sm text-charcoal/60 transition-colors duration-200 hover:text-wine"
          >
            {lienCopie ? <Check size={16} strokeWidth={1.5} className="text-sage" /> : <Share2 size={16} strokeWidth={1.5} />}
            {lienCopie ? "Lien copié" : "Partager"}
          </button>
        </div>

        <p className="mt-2 text-charcoal/80">
          {travail.auteur}
          {travail.encadrant ? ` — sous la direction de ${travail.encadrant}` : ""}
        </p>
        <p className="mt-4 text-charcoal/80">{travail.resume}</p>

        {travail.mots_cles.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {travail.mots_cles.map((mot, index) => {
              const couleurs = [
                "bg-wine/10 text-wine",
                "bg-gold/15 text-gold",
                "bg-sage/15 text-sage",
                "bg-ink/10 text-ink",
              ];
              return (
                <li key={mot} className={`rounded-full px-3 py-1 ${couleurs[index % couleurs.length]}`}>
                  {mot}
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 flex gap-4 text-xs text-charcoal/50">
          <span className="flex items-center gap-1">
            <Eye size={14} strokeWidth={1.5} />
            {travail.consultations} consultations
          </span>
          <span className="flex items-center gap-1">
            <Download size={14} strokeWidth={1.5} />
            {travail.telechargements} téléchargements
          </span>
        </div>

        <a
          href={travail.fichier_url}
          download
          onClick={enregistrerTelechargement}
          className="bouton-principal mt-6"
        >
          <Download size={16} strokeWidth={1.5} />
          Télécharger le PDF
        </a>
        </div>
      )}

      {travail.statut !== "retire" && (
        <div className="mt-10 border border-rule">
          <iframe
            src={travail.fichier_url}
            title={travail.titre}
            className="h-[70vh] w-full"
          />
        </div>
      )}
    </div>
  );
}
