import React, { createContext, useContext, useEffect, useState } from "react";

export type AppTheme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: AppTheme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  effectiveTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined);

const STORAGE_KEY = "web-to-spread-theme";

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      return (chrome?.storage ? defaultTheme : (localStorage.getItem(storageKey) as AppTheme)) || defaultTheme;
    } catch {
      return defaultTheme;
    }
  });
  const [effectiveTheme, setEffectiveTheme] = useState<"dark" | "light">("dark");

  // Load from chrome.storage on mount
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.get(storageKey, (result) => {
        const stored = result[storageKey] as AppTheme | undefined;
        if (stored && ["dark", "light", "system"].includes(stored)) {
          setThemeState(stored);
        }
      });
    } else {
      const stored = localStorage.getItem(storageKey) as AppTheme | null;
      if (stored) setThemeState(stored);
    }
  }, [storageKey]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let computed: "dark" | "light" = "dark";
    if (theme === "system") {
      computed = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      computed = theme;
    }

    setEffectiveTheme(computed);
    root.classList.add(computed);
  }, [theme]);

  // Listen to system preference changes when theme === "system"
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      const resolved = e.matches ? "dark" : "light";
      root.classList.add(resolved);
      setEffectiveTheme(resolved);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    // Persist to chrome.storage or localStorage
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      chrome.storage.local.set({ [storageKey]: newTheme });
    } else {
      localStorage.setItem(storageKey, newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
