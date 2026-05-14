"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  KeyboardEvent,
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

export function SearchBox({ engines }: SearchBoxProps) {
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

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function runSearch() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

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

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") runSearch();
  }

  return (
    <section className="mx-auto w-full max-w-[760px]">
      <form
        onSubmit={handleSubmit}
        className="flex h-16 items-center gap-3 rounded-full border border-border bg-card px-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10"
      >
        <Search aria-hidden size={22} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="搜索或输入网址"
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
          aria-label="搜索"
          title="搜索"
        >
          <ArrowRight aria-hidden size={20} />
        </button>
      </form>

      <div
        className="mt-7 flex justify-start gap-3 overflow-x-auto pb-1 sm:justify-center"
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
                "inline-flex shrink-0 items-center gap-2 rounded-full border py-2.5 pl-3 pr-5 text-sm font-medium shadow-sm transition",
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
                    "inline-flex h-6 w-6 items-center justify-center rounded-full",
                    isActive ? "bg-white" : "bg-background",
                  ].join(" ")}
                >
                  <Image
                    src={iconUrl}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4 rounded-sm object-contain"
                    unoptimized
                  />
                </span>
              ) : null}
              {engine.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
