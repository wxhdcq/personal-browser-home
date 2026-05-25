"use client";

import {
  Bookmark,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Home,
  Puzzle,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { appHref } from "@/core/routing/appHref";

const navItems = [
  { label: "首页", href: "/", icon: Home },
  { label: "书签", href: "/bookmarks", icon: Bookmark },
  { label: "历史", href: "/history", icon: Clock3 },
  { label: "下载", href: "/downloads", icon: Download },
  { label: "插件", href: "/plugins", icon: Puzzle },
  { label: "笔记", href: "/notes", icon: FileText },
  { label: "设置", href: "/settings", icon: Settings },
];

const mobileNavItems = [
  { label: "主页", href: "/", icon: Home },
  { label: "书签", href: "/bookmarks", icon: Bookmark },
  { label: "待办", href: "/#today-todo", icon: ClipboardCheck },
  { label: "设置", href: "/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="order-last mt-2 flex justify-around rounded-2xl border border-border bg-card/95 px-5 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:hidden"
        aria-label="移动端导航"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <a
              key={item.href}
              href={appHref(item.href)}
              className={[
                "flex h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs font-medium transition",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                aria-hidden
                size={23}
                className={isActive ? "fill-primary/15" : undefined}
              />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <aside className="hidden w-44 shrink-0 lg:block">
        <nav className="sticky top-24 flex flex-col gap-2" aria-label="浏览器首页导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);

            return (
              <a
                key={item.href}
                href={appHref(item.href)}
                className={[
                  "flex h-11 items-center justify-start gap-2 rounded-lg px-3 text-sm font-medium transition",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                ].join(" ")}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon aria-hidden size={18} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
