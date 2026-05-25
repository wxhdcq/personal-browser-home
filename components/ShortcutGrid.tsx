"use client";

import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { appHref } from "@/core/routing/appHref";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import type { ShortcutLink } from "@/types/home";

interface ShortcutGridProps {
  shortcuts: ShortcutLink[];
  showManage?: boolean;
  variant?: "default" | "compact";
}

function faviconUrl(shortcut: ShortcutLink) {
  if (shortcut.iconUrl) return shortcut.iconUrl;

  try {
    const url = new URL(shortcut.url);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}

interface PlatformIconProps {
  shortcut: ShortcutLink;
  size?: "sm" | "md";
}

export function PlatformIcon({ shortcut, size = "md" }: PlatformIconProps) {
  const [failed, setFailed] = useState(false);
  const iconUrl = faviconUrl(shortcut);

  if (!iconUrl || failed) {
    return <ExternalLink aria-hidden size={20} />;
  }

  return (
    <Image
      src={iconUrl}
      alt=""
      width={32}
      height={32}
      className={[
        "rounded-md object-contain",
        size === "sm" ? "h-5 w-5" : "h-7 w-7",
      ].join(" ")}
      loading="lazy"
      referrerPolicy="no-referrer"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function ShortcutGrid({
  shortcuts,
  showManage = true,
  variant = "default",
}: ShortcutGridProps) {
  const recordHistory = useHistoryRecorder();
  const isCompact = variant === "compact";

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-lg">
          快捷入口
        </h2>
        {showManage ? (
          <a
            href={appHref("/bookmarks")}
            className="text-sm font-medium text-primary hover:text-primary-strong"
          >
            管理
          </a>
        ) : null}
      </div>
      <div
        className={
          isCompact
            ? "mt-4 grid grid-cols-3 gap-3"
            : "mt-5 grid grid-cols-2 gap-4 sm:gap-4 2xl:grid-cols-3"
        }
      >
        {shortcuts.map((shortcut) => (
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
              "group border border-border bg-card shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-4 focus:ring-primary/10",
              isCompact
                ? "flex h-[92px] flex-col items-center justify-center gap-2 rounded-2xl px-2 text-center"
                : "flex h-24 items-center gap-2.5 rounded-2xl px-3 sm:h-[88px] sm:gap-4 sm:rounded-lg sm:px-5",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex shrink-0 items-center justify-center border border-border bg-background text-primary",
                isCompact
                  ? "h-11 w-11 rounded-2xl"
                  : "h-10 w-10 rounded-xl sm:rounded-lg",
              ].join(" ")}
            >
              <PlatformIcon shortcut={shortcut} />
            </span>
            <span className={isCompact ? "min-w-0" : "min-w-0 flex-1"}>
              <span
                className={[
                  "block truncate font-semibold text-foreground",
                  isCompact ? "max-w-[82px] text-xs" : "text-sm",
                ].join(" ")}
              >
                {shortcut.name}
              </span>
              {!isCompact ? (
                <span className="mt-1 block truncate text-xs text-muted-foreground sm:text-sm">
                  {shortcut.description}
                </span>
              ) : null}
            </span>
            {!isCompact ? (
              <ChevronRight
                aria-hidden
                size={15}
                className="shrink-0 text-soft transition group-hover:text-primary sm:size-4"
              />
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
}
