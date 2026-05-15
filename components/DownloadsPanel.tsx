"use client";

import { Download, ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { downloadResources } from "@/data/downloads";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { DownloadCategory } from "@/types/home";

const categories = [
  "全部",
  "开发工具",
  "文档资料",
  "服务器",
  "常用软件",
] as const;

export function DownloadsPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const recordHistory = useHistoryRecorder();

  const visibleResources = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return downloadResources.filter((resource) => {
      const matchesCategory =
        category === "全部" || resource.category === (category as DownloadCategory);
      const matchesKeyword =
        !keyword ||
        [resource.name, resource.description, resource.url]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [category, query]);

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
            placeholder="搜索下载入口"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={[
                "shrink-0 rounded-lg border px-3 py-2 text-sm transition",
                category === item
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleResources.map((resource) => (
          <article
            key={resource.id}
            className="rounded-lg border border-border bg-elevated/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
                <Download aria-hidden size={19} />
              </span>
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  recordHistory({
                    type: "download",
                    title: resource.name,
                    url: resource.url,
                    description: resource.description,
                  })
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/60 hover:text-primary"
                aria-label="打开下载入口"
                title="打开"
              >
                <ExternalLink aria-hidden size={16} />
              </a>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {resource.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {resource.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{resource.category}</span>
              <span>{resource.sizeLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </SurfaceCard>
  );
}
