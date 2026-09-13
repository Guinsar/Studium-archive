"use client";

import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const envoyerLien = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setErreur("La connexion a échoué. Réessaie dans un instant.");
      return;
    }
    setEnvoye(true);
  };

  return (
    <div className="max-w-prose animate-apparition">
      <h1 className="font-serif text-3xl text-ink">Connexion</h1>
      <p className="mt-3 text-charcoal/80">
        Un lien de connexion sera envoyé à ton adresse email.
      </p>

      {envoye ? (
        <p className="mt-6 flex animate-apparition items-center gap-2 text-sm text-charcoal/80">
          <MailCheck size={18} strokeWidth={1.5} className="text-sage" />
          Vérifie ta boîte mail : un lien de connexion vient de t'être envoyé.
        </p>
      ) : (
        <form onSubmit={envoyerLien} className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
            />
            <input
              type="email"
              placeholder="prenom.nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="champ w-full pl-9"
            />
          </div>
          {erreur && <p className="text-sm text-wine">{erreur}</p>}
          <button type="submit" className="bouton-principal self-start">
            <Mail size={16} strokeWidth={1.5} />
            Recevoir le lien de connexion
          </button>
        </form>
      )}
    </div>
  );
}
