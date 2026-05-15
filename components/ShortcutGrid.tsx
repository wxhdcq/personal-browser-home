"use client";

import { ChevronRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import type { ShortcutLink } from "@/types/home";

interface ShortcutGridProps {
  shortcuts: ShortcutLink[];
  showManage?: boolean;
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

function PlatformIcon({ shortcut }: { shortcut: ShortcutLink }) {
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
      className="h-7 w-7 rounded-md object-contain"
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
}: ShortcutGridProps) {
  const recordHistory = useHistoryRecorder();

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground sm:text-lg">
          快捷入口
        </h2>
        {showManage ? (
          <Link
            href="/bookmarks"
            className="text-sm font-medium text-primary hover:text-primary-strong"
          >
            管理
          </Link>
        ) : null}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-4 2xl:grid-cols-3">
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
            className="group flex h-24 items-center gap-2.5 rounded-2xl border border-border bg-card px-3 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-4 focus:ring-primary/10 sm:h-[88px] sm:gap-4 sm:rounded-lg sm:px-5"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary sm:rounded-lg">
              <PlatformIcon shortcut={shortcut} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {shortcut.name}
              </span>
              <span className="mt-1 block truncate text-xs text-muted-foreground sm:text-sm">
                {shortcut.description}
              </span>
            </span>
            <ChevronRight
              aria-hidden
              size={15}
              className="shrink-0 text-soft transition group-hover:text-primary sm:size-4"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
