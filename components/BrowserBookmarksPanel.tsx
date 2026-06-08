"use client";

import { Bookmark, ExternalLink, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BrowserDataNotice } from "@/components/BrowserDataNotice";
import { SurfaceCard } from "@/components/SurfaceCard";
import { createId } from "@/core/utils/id";
import { shortcutCategories } from "@/types/home";
import { useBrowserBookmarks } from "@/hooks/useBrowserBookmarks";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import { useManagedShortcuts } from "@/hooks/useManagedShortcuts";

export function BrowserBookmarksPanel() {
  const { status, items, error, refresh } = useBrowserBookmarks();
  const [query, setQuery] = useState("");
  const [shortcutsList, setShortcutsList] = useManagedShortcuts();
  const recordHistory = useHistoryRecorder();

  const existingUrls = useMemo(
    () => new Set(shortcutsList.map((shortcut) => shortcut.url)),
    [shortcutsList],
  );

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      [item.title, item.url, item.path].join(" ").toLowerCase().includes(keyword),
    );
  }, [items, query]);

  function addShortcut(item: (typeof items)[number]) {
    if (existingUrls.has(item.url)) return;

    const now = new Date().toISOString();
    setShortcutsList((current) => [
      ...current,
      {
        id: createId(),
        name: item.title,
        url: item.url,
        description: item.path ? `Chrome 书签：${item.path}` : "Chrome 书签",
        category: shortcutCategories[2] ?? shortcutCategories[0],
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }

  return (
    <SurfaceCard padding="sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            浏览器书签
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            扩展版会读取 Chrome / Edge 书签，Web 版保留为不可用状态。
          </p>
        </div>
        <div className="relative md:w-80">
          <Search
            aria-hidden
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-elevated/70 pl-9 pr-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="搜索浏览器书签"
          />
        </div>
      </div>

      <div className="mt-4">
        <BrowserDataNotice
          status={status}
          error={error}
          isEmpty={visibleItems.length === 0}
          emptyText="没有匹配的浏览器书签。"
          unavailableText="当前环境没有开放 chrome.bookmarks，打包成扩展并授予 bookmarks 权限后会显示真实书签。"
          onRefresh={refresh}
        />
      </div>

      {status === "ready" && visibleItems.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleItems.map((item) => {
            const alreadyAdded = existingUrls.has(item.url);

            return (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-elevated/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
                      <Bookmark aria-hidden size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {item.path}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => addShortcut(item)}
                      disabled={alreadyAdded}
                      className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border px-2 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus aria-hidden size={14} />
                      {alreadyAdded ? "已添加" : "加入快捷"}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        recordHistory({
                          type: "bookmark",
                          title: item.title,
                          url: item.url,
                          description: item.path,
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                      aria-label="打开浏览器书签"
                      title="打开"
                    >
                      <ExternalLink aria-hidden size={16} />
                    </a>
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-muted-foreground">
                  {item.url}
                </p>
              </article>
            );
          })}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
