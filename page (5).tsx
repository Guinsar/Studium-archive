"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Presentation, FileText, GraduationCap, Loader2, Shuffle, Bookmark } from "lucide-react";
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

const STYLES_TYPE: Record<Travail["type_travail"], { fond: string; texte: string }> = {
  memoire: { fond: "bg-wine/10", texte: "text-wine" },
  expose: { fond: "bg-gold/15", texte: "text-gold" },
  dissertation: { fond: "bg-sage/15", texte: "text-sage" },
  these: { fond: "bg-ink/10", texte: "text-ink" },
};

function IllustrationAccueil() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="mx-auto h-40 w-auto sm:h-48"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="lueur" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#B98A3D" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#B98A3D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="105" r="105" fill="url(#lueur)" />

      {/* Ruban signet */}
      <path d="M195 40 L195 150 L205 138 L215 150 L215 40 Z" fill="#7A2A2A" />

      {/* Pages du livre ouvert */}
      <path
        d="M55 70 L195 52 L195 165 L55 178 Z"
        fill="#FBF8F1"
        stroke="#D8CFBC"
        strokeWidth="1.5"
      />
      <path
        d="M345 70 L205 52 L205 165 L345 178 Z"
        fill="#FBF8F1"
        stroke="#D8CFBC"
        strokeWidth="1.5"
      />
      <path d="M75 82 L180 68" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 98 L180 85" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 114 L165 102" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <path d="M220 68 L325 82" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <path d="M220 85 L325 98" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <path d="M220 102 L310 114" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />

      {/* Couverture / reliure */}
      <path d="M55 70 L195 52 L205 52 L345 70 L345 82 L205 64 L195 64 L55 82 Z" fill="#1C2B3A" />

      {/* Plume */}
      <g className="origin-[300px_60px] animate-flotter">
        <path
          d="M300 130 C280 100 285 60 320 40 C310 65 312 95 300 130 Z"
          fill="#B98A3D"
        />
        <path d="M300 130 L317 150" stroke="#7A2A2A" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Scintillements */}
      <g className="origin-[90px_50px] animate-scintiller">
        <path d="M90 42 L94 50 L102 54 L94 58 L90 66 L86 58 L78 54 L86 50 Z" fill="#B98A3D" />
      </g>
      <g className="origin-[330px_140px] animate-scintiller [animation-delay:0.8s]">
        <path d="M330 134 L333 140 L339 143 L333 146 L330 152 L327 146 L321 143 L327 140 Z" fill="#7C8B76" />
      </g>
      <g className="origin-[130px_155px] animate-scintiller [animation-delay:1.4s]">
        <circle cx="130" cy="155" r="3.5" fill="#7A2A2A" />
      </g>
    </svg>
  );
}

function IllustrationVide() {
  return (
    <svg viewBox="0 0 160 120" className="mx-auto h-24 w-auto" aria-hidden="true">
      <rect x="35" y="60" width="70" height="10" rx="2" fill="#1C2B3A" />
      <rect x="40" y="40" width="60" height="20" rx="2" fill="#FBF8F1" stroke="#D8CFBC" strokeWidth="1.5" />
      <path d="M45 46 L95 46 M45 52 L85 52" stroke="#D8CFBC" strokeWidth="2" strokeLinecap="round" />
      <circle cx="112" cy="78" r="14" fill="none" stroke="#B98A3D" strokeWidth="3" />
      <line x1="122" y1="88" x2="132" y2="98" stroke="#B98A3D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function CompteurAnime({ cible, suffixe = "" }: { cible: number; suffixe?: string }) {
  const [valeur, setValeur] = useState(0);

  useEffect(() => {
    if (cible === 0) {
      setValeur(0);
      return;
    }
    const duree = 900;
    const depart = performance.now();
    let image: number;

    const animer = (maintenant: number) => {
      const progression = Math.min((maintenant - depart) / duree, 1);
      setValeur(Math.round(cible * (1 - Math.pow(1 - progression, 3))));
      if (progression < 1) image = requestAnimationFrame(animer);
    };
    image = requestAnimationFrame(animer);
    return () => cancelAnimationFrame(image);
  }, [cible]);

  return (
    <span>
      {valeur.toLocaleString("fr-FR")}
      {suffixe}
    </span>
  );
}

const ACCROCHES = [
  "De nouveaux travaux t'attendent peut-être déjà.",
  "Bon courage pour tes révisions.",
  "Quelqu'un avant toi a déjà réfléchi à ta question.",
  "Une trouvaille aujourd'hui t'évitera peut-être une nuit blanche.",
];

const MESSAGES_FIDELITE: Record<number, string> = {
  5: "Cinquième visite. Tu commences à connaître le chemin.",
  15: "Quinzième visite. Les archives te connaissent bien, maintenant.",
  30: "Trentième visite. On peut dire que tu es des nôtres.",
};

export default function Accueil() {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [annee, setAnnee] = useState("");
  const [travaux, setTravaux] = useState<Travail[]>([]);
  const [chargement, setChargement] = useState(true);
  const [statistiques, setStatistiques] = useState<{ total: number; consultations: number } | null>(null);
  const [accroche, setAccroche] = useState(ACCROCHES[0]);
  const [tirageEnCours, setTirageEnCours] = useState(false);
  const [favoris, setFavoris] = useState<Set<string>>(new Set());
  const [messageFidelite, setMessageFidelite] = useState<string | null>(null);
  const rechercheRef = useRef<HTMLInputElement>(null);

  const basculerFavori = async (e: React.MouseEvent, travailId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (favoris.has(travailId)) {
      await supabase.from("favoris").delete().eq("user_id", user.id).eq("travail_id", travailId);
      setFavoris((precedent) => {
        const suivant = new Set(precedent);
        suivant.delete(travailId);
        return suivant;
      });
    } else {
      await supabase.from("favoris").insert({ user_id: user.id, travail_id: travailId });
      setFavoris((precedent) => new Set(precedent).add(travailId));
    }
  };

  const surprendsMoi = async () => {
    setTirageEnCours(true);
    const { data } = await supabase.from("travaux").select("id").eq("statut", "publie");
    setTirageEnCours(false);
    if (!data || data.length === 0) return;
    const choix = data[Math.floor(Math.random() * data.length)];
    router.push(`/document/${choix.id}`);
  };

  useEffect(() => {
    const surRaccourci = (e: KeyboardEvent) => {
      const cible = e.target as HTMLElement;
      const dansUnChamp = cible.tagName === "INPUT" || cible.tagName === "TEXTAREA";

      if (e.key === "/" && !dansUnChamp) {
        e.preventDefault();
        rechercheRef.current?.focus();
      }
      if (e.key === "Escape" && cible === rechercheRef.current) {
        setRecherche("");
        rechercheRef.current?.blur();
      }
    };
    window.addEventListener("keydown", surRaccourci);
    return () => window.removeEventListener("keydown", surRaccourci);
  }, []);

  useEffect(() => {
    const visites = Number(localStorage.getItem("visites") ?? "0") + 1;
    localStorage.setItem("visites", String(visites));
    if (MESSAGES_FIDELITE[visites]) setMessageFidelite(MESSAGES_FIDELITE[visites]);

    const chargerFavoris = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("favoris").select("travail_id").eq("user_id", user.id);
      setFavoris(new Set((data ?? []).map((f) => f.travail_id)));
    };
    chargerFavoris();
  }, []);

  useEffect(() => {
    setAccroche(ACCROCHES[Math.floor(Math.random() * ACCROCHES.length)]);

    const chargerStatistiques = async () => {
      const { data } = await supabase.from("travaux").select("consultations").eq("statut", "publie");
      if (!data) return;
      setStatistiques({
        total: data.length,
        consultations: data.reduce((somme, t) => somme + t.consultations, 0),
      });
    };
    chargerStatistiques();
  }, []);

  useEffect(() => {
    const charger = async () => {
      setChargement(true);
      let requete = supabase
        .from("travaux")
        .select("*")
        .eq("statut", "publie")
        .order("cree_le", { ascending: false });

      if (annee) requete = requete.eq("annee", Number(annee));
      if (recherche) requete = requete.textSearch("recherche", recherche);

      const { data } = await requete;
      setTravaux(data ?? []);
      setChargement(false);
    };
    charger();
  }, [recherche, annee]);

  return (
    <div>
      <IllustrationAccueil />

      <div className="mb-10 mt-6 max-w-prose text-center sm:text-left">
        <h1 className="font-serif text-3xl text-ink">
          Les travaux de la filière Droit, réunis en un seul lieu
        </h1>
        <p className="mt-3 text-charcoal/80">
          Mémoires, exposés et dissertations déposés par les étudiants,
          consultables librement une fois validés.
        </p>
        <p className="mt-2 font-serif italic text-gold">{accroche}</p>
        {messageFidelite && (
          <p className="mt-1 animate-apparition text-xs text-sage">{messageFidelite}</p>
        )}

        {statistiques && statistiques.total > 0 && (
          <div className="mt-6 flex justify-center gap-8 sm:justify-start">
            <div>
              <p className="font-serif text-2xl text-ink">
                <CompteurAnime cible={statistiques.total} />
              </p>
              <p className="text-xs text-charcoal/60">travaux archivés</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-ink">
                <CompteurAnime cible={statistiques.consultations} />
              </p>
              <p className="text-xs text-charcoal/60">consultations au total</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.5}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
          />
          <input
            ref={rechercheRef}
            type="text"
            placeholder="Rechercher par titre, mot-clé ou résumé"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="champ w-full pl-9 pr-9 text-sm"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-rule px-1.5 py-0.5 text-[10px] text-charcoal/40">
            /
          </kbd>
        </div>
        <input
          type="number"
          placeholder="Année"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          className="champ w-full text-sm sm:w-32"
        />
        <button
          type="button"
          onClick={surprendsMoi}
          disabled={tirageEnCours}
          className="bouton-discret justify-center whitespace-nowrap text-sm disabled:opacity-50"
        >
          {tirageEnCours ? <Loader2 size={16} className="animate-spin" /> : <Shuffle size={16} strokeWidth={1.5} />}
          Surprends-moi
        </button>
      </div>

      {chargement && (
        <p className="flex items-center gap-2 text-sm text-charcoal/60">
          <Loader2 size={14} className="animate-spin" />
          Chargement en cours.
        </p>
      )}

      {!chargement && travaux.length === 0 && (
        <div className="animate-apparition py-8 text-center">
          <IllustrationVide />
          <p className="mt-4 text-sm text-charcoal/60">
            Aucun travail ne correspond à cette recherche pour le moment.
          </p>
        </div>
      )}

      <ul className="divide-y divide-rule">
        {travaux.map((travail, index) => {
          const Icone = ICONES_TYPE[travail.type_travail];
          const style = STYLES_TYPE[travail.type_travail];
          const recent = Date.now() - new Date(travail.cree_le).getTime() < 7 * 24 * 60 * 60 * 1000;
          return (
            <li
              key={travail.id}
              className="animate-apparition"
              style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
            >
              <Link
                href={`/document/${travail.id}`}
                className="group -mx-3 flex gap-4 rounded-sm px-3 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface/80 hover:shadow-md"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.fond} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icone size={18} strokeWidth={1.5} className={style.texte} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="flex items-center gap-2 font-serif text-lg text-ink transition-colors duration-200 group-hover:text-wine">
                      {travail.titre}
                      {recent && (
                        <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-sans font-medium tracking-wide text-gold">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                          NOUVEAU
                        </span>
                      )}
                    </h2>
                    <span className="shrink-0 text-sm text-charcoal/60">
                      {travail.annee}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/70">
                    {LABELS_TYPE[travail.type_travail]} — {travail.auteur}
                    {travail.encadrant ? ` — sous la direction de ${travail.encadrant}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-charcoal/80">
                    {travail.resume}
                  </p>
                </div>
                <button
                  onClick={(e) => basculerFavori(e, travail.id)}
                  aria-label={favoris.has(travail.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className="shrink-0 self-start p-1 text-charcoal/30 transition-colors duration-200 hover:text-gold"
                >
                  <Bookmark
                    size={18}
                    strokeWidth={1.5}
                    className={favoris.has(travail.id) ? "fill-gold text-gold" : ""}
                  />
                </button>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

