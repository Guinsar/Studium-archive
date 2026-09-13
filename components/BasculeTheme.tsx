"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function BasculeTheme() {
  const [sombre, setSombre] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const prefere = localStorage.getItem("theme") === "sombre";
    setSombre(prefere);
    document.documentElement.classList.toggle("dark", prefere);
    setPret(true);
  }, []);

  const basculer = () => {
    const nouveau = !sombre;
    setSombre(nouveau);
    document.documentElement.classList.toggle("dark", nouveau);
    localStorage.setItem("theme", nouveau ? "sombre" : "clair");
  };

  if (!pret) return <span className="h-4 w-4" />;

  return (
    <button
      onClick={basculer}
      aria-label={sombre ? "Passer au mode clair" : "Passer au mode sombre"}
      className="flex items-center gap-1.5 transition-colors duration-200 hover:text-wine"
    >
      {sombre ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      {sombre ? "Mode clair" : "Mode sombre"}
    </button>
  );
}
