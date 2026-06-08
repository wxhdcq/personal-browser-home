"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultSettings } from "@/data/settings";
import { storageKeys } from "@/data/storageKeys";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SearchEngine, SearchEngineId, UserSettings } from "@/types/home";

interface SearchBoxProps {
  engines: SearchEngine[];
  showEngines?: boolean;
  className?: string;
}

function buildSearchUrl(template: string, query: string) {
  return template.replace("{query}", encodeURIComponent(query.trim()));
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^[\w-]+(\.[\w-]+)+/.test(value);
}

function engineIconUrl(engine: SearchEngine) {
  if (engine.iconUrl) return engine.iconUrl;

  try {
    const url = new URL(engine.urlTemplate.replace("{query}", ""));
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}

export function SearchBox({
  engines,
  showEngines = true,
  className = "",
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [engineId, setEngineId] = useState<SearchEngineId | null>(null);
  const [settings] = useLocalStorage<UserSettings>(
    storageKeys.settings,
    defaultSettings,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const recordHistory = useHistoryRecorder();

  const effectiveEngineId = engineId ?? settings.defaultSearchEngine;
  const selectedEngine = useMemo(
    () =>
      engines.find((engine) => engine.id === effectiveEngineId) ?? engines[0],
    [effectiveEngineId, engines],
  );

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    if (window.matchMedia("(min-width: 640px)").matches) {
      inputRef.current?.focus();
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function runSearch() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || !selectedEngine) return;

    if (looksLikeUrl(trimmedQuery)) {
      window.location.href = /^https?:\/\//i.test(trimmedQuery)
        ? trimmedQuery
        : `https://${trimmedQuery}`;
      return;
    }

    const searchUrl = buildSearchUrl(selectedEngine.urlTemplate, trimmedQuery);
    recordHistory({
      type: "search",
      title: trimmedQuery,
      url: searchUrl,
      description: `使用 ${selectedEngine.name} 搜索`,
      metadata: { engine: selectedEngine.id },
    });
    window.location.href = searchUrl;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runSearch();
  }

  return (
    <section
      className={["mx-auto w-full max-w-[760px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-14 items-center gap-3 rounded-full border border-border bg-card px-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 sm:h-16 sm:px-5"
      >
        <Search
          aria-hidden
          size={22}
          className="shrink-0 text-muted-foreground"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          placeholder={selectedEngine?.placeholder ?? "搜索或输入网址"}
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary transition hover:bg-primary hover:text-primary-foreground"
          aria-label="搜索"
          title="搜索"
        >
          <ArrowRight aria-hidden size={21} />
        </button>
      </form>

      {showEngines ? (
        <div
          className="mt-5 grid grid-cols-4 gap-2 pb-1 sm:mt-7 sm:flex sm:justify-center sm:gap-3 sm:overflow-x-auto"
          role="tablist"
          aria-label="搜索引擎"
        >
          {engines.map((engine) => {
            const isActive = engine.id === effectiveEngineId;
            const iconUrl = engineIconUrl(engine);
            return (
              <button
                key={engine.id}
                type="button"
                onClick={() => setEngineId(engine.id)}
                className={[
                  "inline-flex h-12 min-w-0 items-center justify-center gap-1 rounded-2xl border px-1.5 py-2 text-[11px] font-medium shadow-sm transition sm:h-11 sm:shrink-0 sm:gap-2 sm:rounded-full sm:pl-3 sm:pr-4 sm:text-sm",
                  isActive
                    ? "border-primary/20 bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/30 hover:text-primary",
                ].join(" ")}
                role="tab"
                aria-selected={isActive}
              >
                {iconUrl ? (
                  <span
                    className={[
                      "inline-flex h-5 w-5 items-center justify-center rounded-full sm:h-6 sm:w-6",
                      isActive ? "bg-white" : "bg-background",
                    ].join(" ")}
                  >
                    <Image
                      src={iconUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="h-3.5 w-3.5 rounded-sm object-contain sm:h-4 sm:w-4"
                      unoptimized
                    />
                  </span>
                ) : null}
                <span className="whitespace-nowrap">{engine.name}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
