"use client";

import { ChevronRight, Pencil } from "lucide-react";
import { PlatformIcon } from "@/components/ShortcutGrid";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appHref } from "@/core/routing/appHref";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import type { ShortcutLink } from "@/types/home";

const preferredShortcutIds = [
  "github",
  "vercel",
  "youtube",
  "chatgpt",
  "notion",
  "google-translate",
  "wechat-read",
  "tencent-docs",
  "bilibili",
  "weibo",
  "feishu",
];

interface TopShortcutsProps {
  shortcuts: ShortcutLink[];
  variant?: "hero" | "sidebar";
}

function pickTopShortcuts(shortcuts: ShortcutLink[], limit: number) {
  const preferred = preferredShortcutIds
    .map((id) => shortcuts.find((shortcut) => shortcut.id === id))
    .filter((shortcut): shortcut is ShortcutLink => Boolean(shortcut));
  const rest = shortcuts.filter(
    (shortcut) => !preferredShortcutIds.includes(shortcut.id),
  );

  return [...preferred, ...rest].slice(0, limit);
}

export function TopShortcuts({ shortcuts, variant = "hero" }: TopShortcutsProps) {
  const recordHistory = useHistoryRecorder();
  const isSidebar = variant === "sidebar";
  const visibleShortcuts = pickTopShortcuts(shortcuts, isSidebar ? 12 : 6);

  const content = (
    <>
      {isSidebar ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">快捷入口</h2>
          <a
            href={appHref("/bookmarks")}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-strong"
          >
            <Pencil aria-hidden size={14} />
            编辑
          </a>
        </div>
      ) : null}
      <div
        className={[
          "grid gap-3",
          isSidebar
            ? "mt-4 grid-cols-3 gap-x-2 gap-y-3"
            : "grid-cols-3 lg:grid-cols-6",
        ].join(" ")}
      >
        {visibleShortcuts.map((shortcut) => (
          <a
            key={shortcut.id}
            href={shortcut.url}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              recordHistory({
                type: "shortcut",
                title: shortcut.name,
                url: shortcut.url,
                description: shortcut.description,
                metadata: { category: shortcut.category },
              })
            }
            className={[
              "group flex min-w-0 items-center transition",
              isSidebar
                ? "h-7 gap-1.5 rounded-md px-0 text-left hover:text-primary"
                : "h-20 flex-col justify-center gap-2 rounded-2xl border border-border bg-card/95 px-2 text-center shadow-[0_16px_42px_rgba(15,23,42,0.07)] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_52px_rgba(15,23,42,0.12)]",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex shrink-0 items-center justify-center text-primary",
                isSidebar
                  ? "h-6 w-6"
                  : "h-9 w-9 rounded-xl border border-border bg-background",
              ].join(" ")}
            >
              <PlatformIcon shortcut={shortcut} size={isSidebar ? "sm" : "md"} />
            </span>
            <span
              className={[
                "flex min-w-0 items-center gap-1 font-semibold text-foreground",
                isSidebar
                  ? "text-[13px] font-medium group-hover:text-primary"
                  : "max-w-full text-xs",
              ].join(" ")}
            >
              <span className="truncate">{shortcut.name}</span>
              <ChevronRight
                aria-hidden
                size={13}
                className={[
                  "shrink-0 text-soft transition group-hover:text-primary",
                  isSidebar ? "hidden" : "hidden 2xl:block",
                ].join(" ")}
              />
            </span>
          </a>
        ))}
      </div>
    </>
  );

  if (isSidebar) {
    return <SurfaceCard padding="sm">{content}</SurfaceCard>;
  }

  return (
    <section className="mx-auto mt-7 w-full max-w-[900px] xl:mx-0">
      {content}
    </section>
  );
}
