"use client";

import { Clock3, ExternalLink, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { HistoryEntry } from "@/types/home";

const filters = ["全部", "search", "shortcut", "bookmark", "download"] as const;

function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function typeLabel(type: HistoryEntry["type"]) {
  const labels: Record<HistoryEntry["type"], string> = {
    search: "搜索",
    shortcut: "快捷入口",
    bookmark: "书签",
    download: "下载",
  };

  return labels[type];
}

export function HistoryPanel() {
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    storageKeys.history,
    [],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("全部");

  const visibleHistory = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return history.filter((entry) => {
      const matchesType = filter === "全部" || entry.type === filter;
      const matchesKeyword =
        !keyword ||
        [entry.title, entry.url, entry.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesType && matchesKeyword;
    });
  }, [filter, history, query]);

  return (
    <SurfaceCard padding="sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-96">
          <Search
            aria-hidden
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-elevated/70 pl-9 pr-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="搜索历史记录"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={[
                "shrink-0 rounded-lg border px-3 py-2 text-sm transition",
                filter === item
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item === "全部" ? item : typeLabel(item)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setHistory([])}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-danger/40 hover:text-danger"
          >
            <Trash2 aria-hidden size={15} />
            清空
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {visibleHistory.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-elevated/40 px-4 py-12 text-center text-sm text-muted-foreground">
            还没有历史记录。搜索或点击快捷入口后会自动出现在这里。
          </div>
        ) : (
          visibleHistory.map((entry) => (
            <article
              key={entry.id}
              className="grid gap-3 rounded-lg border border-border bg-elevated/70 p-4 md:grid-cols-[140px_minmax(0,1fr)_auto]"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 aria-hidden size={16} />
                {formatTime(entry.createdAt)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {entry.title}
                  </h3>
                  <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {typeLabel(entry.type)}
                  </span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {entry.description ?? entry.url}
                </p>
              </div>
              <a
                href={entry.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                aria-label="打开历史记录"
                title="打开"
              >
                <ExternalLink aria-hidden size={16} />
              </a>
            </article>
          ))
        )}
      </div>
    </SurfaceCard>
  );
}
