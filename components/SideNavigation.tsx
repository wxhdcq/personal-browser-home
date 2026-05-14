"use client";

import {
  Bookmark,
  Clock3,
  Download,
  FileText,
  Home,
  Puzzle,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "首页", href: "/", icon: Home },
  { label: "书签", href: "/bookmarks", icon: Bookmark },
  { label: "历史", href: "/history", icon: Clock3 },
  { label: "下载", href: "/downloads", icon: Download },
  { label: "插件", href: "/plugins", icon: Puzzle },
  { label: "笔记", href: "/notes", icon: FileText },
  { label: "设置", href: "/settings", icon: Settings },
];

export function SideNavigation() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-44">
      <nav
        className="flex gap-2 overflow-x-auto rounded-lg bg-card/70 p-2 shadow-sm shadow-slate-200/50 backdrop-blur lg:sticky lg:top-24 lg:flex-col lg:overflow-visible lg:bg-transparent lg:p-0 lg:shadow-none"
        aria-label="浏览器首页导航"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex h-11 min-w-20 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition lg:justify-start",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-card hover:text-foreground",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon aria-hidden size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
