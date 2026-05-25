"use client";

import {
  Bookmark,
  Clock3,
  Download,
  FileText,
  Puzzle,
  Settings,
} from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";
import { appHref } from "@/core/routing/appHref";

const utilityLinks = [
  { label: "历史记录", href: "/history", icon: Clock3 },
  { label: "下载管理", href: "/downloads", icon: Download },
  { label: "插件管理", href: "/plugins", icon: Puzzle },
  { label: "书签管理", href: "/bookmarks", icon: Bookmark },
  { label: "笔记中心", href: "/notes", icon: FileText },
  { label: "设置中心", href: "/settings", icon: Settings },
];

export function UtilityLinksCard() {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">常用工具</h2>
        <span className="text-xs text-muted-foreground">快速跳转</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {utilityLinks.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.href}
              href={appHref(item.href)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              <Icon aria-hidden size={17} />
              <span className="truncate">{item.label}</span>
            </a>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
