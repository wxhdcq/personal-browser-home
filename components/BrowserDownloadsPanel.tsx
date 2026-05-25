"use client";

import { Download, ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BrowserDataNotice } from "@/components/BrowserDataNotice";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useBrowserDownloads } from "@/hooks/useBrowserDownloads";

function basename(filename: string) {
  return filename.split(/[\\/]/).filter(Boolean).pop() ?? filename;
}

function formatStartTime(value?: string) {
  if (!value) return "未知时间";

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function stateLabel(state?: string) {
  const labels: Record<string, string> = {
    complete: "已完成",
    interrupted: "已中断",
    in_progress: "下载中",
  };

  return state ? labels[state] ?? state : "未知状态";
}

export function BrowserDownloadsPanel() {
  const { status, items, error, refresh } = useBrowserDownloads();
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      [item.filename, item.url, item.state]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, query]);

  return (
    <SurfaceCard padding="sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            浏览器下载记录
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            扩展版读取最近下载项，只在本地页面展示。
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
            placeholder="搜索下载记录"
          />
        </div>
      </div>

      <div className="mt-4">
        <BrowserDataNotice
          status={status}
          error={error}
          isEmpty={visibleItems.length === 0}
          emptyText="没有匹配的下载记录。"
          unavailableText="当前环境没有开放 chrome.downloads，打包成扩展并授予 downloads 权限后会显示真实下载记录。"
          onRefresh={refresh}
        />
      </div>

      {status === "ready" && visibleItems.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const title = item.filename ? basename(item.filename) : item.url;

            return (
              <article
                key={item.id}
                className="rounded-lg border border-border bg-elevated/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
                    <Download aria-hidden size={19} />
                  </span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                      aria-label="打开下载来源"
                      title="打开来源"
                    >
                      <ExternalLink aria-hidden size={16} />
                    </a>
                  ) : null}
                </div>
                <h3 className="mt-4 truncate text-sm font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  {item.url || item.filename}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>{stateLabel(item.state)}</span>
                  <span>{formatStartTime(item.startTime)}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </SurfaceCard>
  );
}
