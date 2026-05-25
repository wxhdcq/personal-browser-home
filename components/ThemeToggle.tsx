"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";

const themeStorageKey = "personal-home.theme";
const themeChangeEvent = "personal-home.theme-change";

type ThemeMode = "dark" | "light";

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function readThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorageAdapter.getItemSync(themeStorageKey) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  const unsubscribe = localStorageAdapter.subscribe(themeStorageKey, callback);

  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    unsubscribe();
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeToTheme,
    readThemeSnapshot,
    () => "light",
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      void localStorageAdapter.setItem(themeStorageKey, nextTheme);
    } catch {
      // Theme still applies for this page even if persistence is blocked.
    }

    window.dispatchEvent(new Event(themeChangeEvent));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-card hover:text-foreground"
      aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
      title={theme === "dark" ? "浅色模式" : "深色模式"}
    >
      {theme === "dark" ? <Sun aria-hidden size={18} /> : <Moon aria-hidden size={18} />}
    </button>
  );
}
