"use client";

import { Clock3, ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BrowserDataNotice } from "@/components/BrowserDataNotice";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useBrowserHistory } from "@/hooks/useBrowserHistory";

function formatVisitTime(value?: number) {
  if (!value) return "未知时间";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function BrowserHistoryPanel() {
  const { status, items, error, refresh } = useBrowserHistory();
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      [item.title, item.url].join(" ").toLowerCase().includes(keyword),
    );
  }, [items, query]);

  return (
    <SurfaceCard padding="sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            浏览器历史
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            扩展版会读取最近访问记录；这里不保存或上传你的历史数据。
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
            placeholder="搜索浏览器历史"
          />
        </div>
      </div>

      <div className="mt-4">
        <BrowserDataNotice
          status={status}
          error={error}
          isEmpty={visibleItems.length === 0}
          emptyText="没有匹配的浏览器历史。"
          unavailableText="当前环境没有开放 chrome.history，打包成扩展并授予 history 权限后会显示真实历史。"
          onRefresh={refresh}
        />
      </div>

      {status === "ready" && visibleItems.length > 0 ? (
        <div className="mt-4 space-y-2">
          {visibleItems.map((item) => (
            <article
              key={`${item.id}-${item.lastVisitTime ?? ""}`}
              className="grid gap-3 rounded-lg border border-border bg-elevated/70 p-4 md:grid-cols-[140px_minmax(0,1fr)_auto]"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 aria-hidden size={16} />
                {formatVisitTime(item.lastVisitTime)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {item.title || item.url}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {item.url}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                aria-label="打开浏览器历史"
                title="打开"
              >
                <ExternalLink aria-hidden size={16} />
              </a>
            </article>
          ))}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
