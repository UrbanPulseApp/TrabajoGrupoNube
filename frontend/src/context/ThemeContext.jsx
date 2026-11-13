import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "urbanpulse-theme";
const THEME_COLORS = { light: "#f2f5f4", dark: "#0a1214" };

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }) {
  const [explicit, setExplicit] = useState(storedTheme);
  const [system, setSystem] = useState(systemTheme);
  const theme = explicit || system;

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  }, [theme]);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setExplicit(next);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* almacenamiento no disponible */ }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
