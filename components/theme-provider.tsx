"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  const toggle = () => {
    setTheme((t) => {
      const next = t === "light" ? "dark" : "light";
      document.documentElement.classList.toggle("dark", next === "dark");
      try { localStorage.setItem("gate-theme", next); } catch {}
      return next;
    });
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
