"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import type { ShortcutLink } from "@/types/home";

interface ShortcutGridProps {
  shortcuts: ShortcutLink[];
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
      width={24}
      height={24}
      className="h-6 w-6 rounded-sm object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}

export function ShortcutGrid({ shortcuts }: ShortcutGridProps) {
  const recordHistory = useHistoryRecorder();

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">快捷入口</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
            className="group flex h-[88px] items-center gap-4 rounded-lg border border-border bg-card px-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_45px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-4 focus:ring-primary/10"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
              <PlatformIcon shortcut={shortcut} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {shortcut.name}
              </span>
              <span className="mt-1 block truncate text-sm text-muted-foreground">
                {shortcut.description}
              </span>
            </span>
            <ExternalLink
              aria-hidden
              size={16}
              className="text-soft opacity-0 transition group-hover:opacity-100"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
