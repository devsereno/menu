import { useEffect, useState } from "react";
import { aplicarTema, alternarTema, lerTema, type Tema } from "../lib/theme";

export default function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    const t = lerTema();
    aplicarTema(t);
    setTema(t);
  }, []);

  return (
    <button
      type="button"
      aria-label={tema === "light" ? "Usar tema escuro" : "Usar tema claro"}
      title={tema === "light" ? "Tema escuro" : "Tema claro"}
      className="rounded-full border border-violet-400/35 px-2.5 py-1.5 text-xs"
      onClick={() => setTema(alternarTema())}
    >
      {tema === "light" ? "🌙" : "☀️"}
    </button>
  );
}
