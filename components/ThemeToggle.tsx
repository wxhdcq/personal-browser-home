"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

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
    return window.localStorage.getItem(themeStorageKey) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function subscribeToTheme(callback: () => void) {
  function handleStorageChange(event: StorageEvent) {
    if (event.key === themeStorageKey) callback();
  }

  window.addEventListener(themeChangeEvent, callback);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    window.removeEventListener("storage", handleStorageChange);
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
      window.localStorage.setItem(themeStorageKey, nextTheme);
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
