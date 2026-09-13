"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const COULEURS_CONFETTI = ["#7A2A2A", "#B98A3D", "#7C8B76", "#1C2B3A"];

export default function Deposer() {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [accordCharte, setAccordCharte] = useState(false);
  const [succes, setSucces] = useState(false);

  const soumettre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErreur(null);

    if (!accordCharte) {
      setErreur("La charte de dépôt doit être acceptée avant l'envoi.");
      return;
    }

    setEnvoi(true);

    const formulaire = new FormData(e.currentTarget);
    const fichier = formulaire.get("fichier") as File;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErreur("Connecte-toi avant de déposer un travail.");
      setEnvoi(false);
      return;
    }

    const cheminFichier = `${user.id}/${Date.now()}-${fichier.name}`;
    const { error: erreurUpload } = await supabase.storage
      .from("travaux-pdf")
      .upload(cheminFichier, fichier);

    if (erreurUpload) {
      setErreur("Le fichier n'a pas pu être envoyé. Réessaie.");
      setEnvoi(false);
      return;
    }

    const { data: url } = supabase.storage
      .from("travaux-pdf")
      .getPublicUrl(cheminFichier);

    const { error: erreurInsertion } = await supabase.from("travaux").insert({
      titre: formulaire.get("titre"),
      auteur: formulaire.get("auteur"),
      matricule: formulaire.get("matricule") || null,
      annee: Number(formulaire.get("annee")),
      type_travail: formulaire.get("type_travail"),
      encadrant: formulaire.get("encadrant") || null,
      resume: formulaire.get("resume"),
      mots_cles: String(formulaire.get("mots_cles"))
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      fichier_url: url.publicUrl,
      depose_par: user.id,
      consentement_diffusion: true,
      consentement_le: new Date().toISOString(),
    });

    setEnvoi(false);

    if (erreurInsertion) {
      setErreur("Le dépôt n'a pas pu être enregistré. Réessaie.");
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/?depot=envoye"), 1700);
  };

  if (succes) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="relative">
          <CheckCircle2 size={64} strokeWidth={1.5} className="animate-surgir text-sage" />
          {COULEURS_CONFETTI.map((couleur, i) => (
            <span
              key={i}
              className="absolute left-1/2 top-1/2 h-2 w-2 animate-confetti rounded-full"
              style={{
                backgroundColor: couleur,
                animationDelay: `${i * 0.08}s`,
                transform: `translate(${(i - 1.5) * 22}px, 0)`,
              }}
            />
          ))}
        </div>
        <p className="mt-6 font-serif text-xl text-ink">Travail déposé avec succès</p>
        <p className="mt-2 text-sm text-charcoal/70">
          Il sera visible dès qu'un modérateur l'aura validé.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-prose animate-apparition">
      <h1 className="font-serif text-3xl text-ink">Déposer un travail</h1>
      <p className="mt-3 text-charcoal/80">
        Le travail sera visible par les autres étudiants après validation par
        un modérateur.
      </p>

      <form onSubmit={soumettre} className="mt-8 flex flex-col gap-5">
        <Champ label="Titre">
          <input name="titre" required className="champ" />
        </Champ>
        <Champ label="Auteur">
          <input name="auteur" required className="champ" />
        </Champ>
        <Champ label="Numéro d'étudiant (matricule)">
          <input name="matricule" className="champ" />
        </Champ>
        <p className="-mt-3 text-xs text-charcoal/60">
          Sert uniquement au modérateur pour vérifier ton identité avant de
          valider le dépôt, sans adresse email universitaire disponible.
        </p>
        <div className="flex gap-4">
          <Champ label="Année" className="w-32">
            <input name="annee" type="number" required className="champ" />
          </Champ>
          <Champ label="Type de travail" className="flex-1">
            <select name="type_travail" required className="champ">
              <option value="memoire">Mémoire</option>
              <option value="expose">Exposé</option>
              <option value="dissertation">Dissertation</option>
              <option value="these">Thèse</option>
            </select>
          </Champ>
        </div>
        <Champ label="Encadrant (facultatif)">
          <input name="encadrant" className="champ" />
        </Champ>
        <Champ label="Résumé">
          <textarea name="resume" required rows={5} className="champ" />
        </Champ>
        <Champ label="Mots-clés (séparés par des virgules)">
          <input name="mots_cles" placeholder="droit administratif, contentieux, UFHB" className="champ" />
        </Champ>
        <Champ label="Fichier PDF">
          <input name="fichier" type="file" accept="application/pdf" required className="champ" />
        </Champ>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={accordCharte}
            onChange={(e) => setAccordCharte(e.target.checked)}
            className="mt-1"
          />
          <span>
            J'ai lu la{" "}
            <Link href="/charte" target="_blank" className="text-wine underline">
              charte de dépôt
            </Link>{" "}
            et j'autorise la diffusion de ce travail aux autres étudiants de
            la filière.
          </span>
        </label>

        {erreur && <p className="text-sm text-wine">{erreur}</p>}

        <button
          type="submit"
          disabled={envoi}
          className="bouton-principal mt-2 self-start disabled:opacity-50"
        >
          {envoi ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} strokeWidth={1.5} />}
          {envoi ? "Envoi en cours" : "Déposer le travail"}
        </button>
      </form>
    </div>
  );
}

function Champ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      <span className="text-charcoal/70">{label}</span>
      {children}
    </label>
  );
}
