export type Tema = "dark" | "light";

const KEY = "fc-tema";

export function lerTema(): Tema {
  try {
    const t = localStorage.getItem(KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function aplicarTema(tema: Tema) {
  document.documentElement.setAttribute("data-theme", tema);
  document.documentElement.style.colorScheme = tema === "light" ? "light" : "dark";
  try {
    localStorage.setItem(KEY, tema);
  } catch {
    /* ignore */
  }
}

export function alternarTema(): Tema {
  const next: Tema = lerTema() === "light" ? "dark" : "light";
  aplicarTema(next);
  return next;
}
