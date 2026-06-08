"use client";

import { Moon, Sun, Zap } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";

const themeStorageKey = "personal-home.theme";
const themeChangeEvent = "personal-home.theme-change";

type ThemeMode = "light" | "dark" | "cyberpunk";

const themeOrder: ThemeMode[] = ["light", "dark", "cyberpunk"];

const themeLabels: Record<ThemeMode, string> = {
  light: "浅色模式",
  dark: "深色模式",
  cyberpunk: "赛博朋克",
};

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("dark", "cyberpunk");
  if (theme === "dark") root.classList.add("dark");
  if (theme === "cyberpunk") root.classList.add("cyberpunk");
  root.style.colorScheme = theme === "light" ? "light" : "dark";
}

function readThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorageAdapter.getItemSync(themeStorageKey);
    if (stored === "dark" || stored === "cyberpunk") return stored;
    return "light";
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

function ThemeIcon({ theme, size }: { theme: ThemeMode; size: number }) {
  if (theme === "light") return <Sun aria-hidden size={size} />;
  if (theme === "dark") return <Moon aria-hidden size={size} />;
  return <Zap aria-hidden size={size} />;
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeToTheme,
    readThemeSnapshot,
    () => "light",
  );
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function setTheme(nextTheme: ThemeMode) {
    applyTheme(nextTheme);

    try {
      void localStorageAdapter.setItem(themeStorageKey, nextTheme);
    } catch {
      // Theme still applies for this page even if persistence is blocked.
    }

    window.dispatchEvent(new Event(themeChangeEvent));
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
          theme === "cyberpunk"
            ? "text-neon-cyan hover:bg-neon-cyan/10"
            : "text-muted-foreground hover:bg-card hover:text-foreground",
        ].join(" ")}
        aria-label={themeLabels[theme]}
        title={themeLabels[theme]}
      >
        <ThemeIcon theme={theme} size={18} />
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 min-w-36 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-lg cyberpunk:border-neon-cyan/20 cyberpunk:shadow-[var(--neon-glow-sm)]">
          {themeOrder.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTheme(mode)}
              className={[
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition",
                mode === theme
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-background hover:text-foreground",
              ].join(" ")}
            >
              <ThemeIcon theme={mode} size={16} />
              {themeLabels[mode]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
