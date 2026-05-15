"use client";

import { ChevronDown, Timer } from "lucide-react";
import { DailyQuoteCard } from "@/components/DailyQuoteCard";
import { FocusTimer } from "@/components/FocusTimer";
import { InvestmentWatchlist } from "@/components/InvestmentWatchlist";
import { TopShortcuts } from "@/components/TopShortcuts";
import { investmentAssets } from "@/data/investments";
import { useModulePreferences } from "@/hooks/useModulePreferences";
import type { ShortcutLink } from "@/types/home";

interface HomeSidebarProps {
  shortcuts: ShortcutLink[];
}

function FoldedFocusTimer() {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-[0_16px_42px_rgba(15,23,42,0.06)]">
        <span className="inline-flex items-center gap-2">
          <Timer aria-hidden size={17} className="text-primary" />
          专注计时
        </span>
        <ChevronDown
          aria-hidden
          size={17}
          className="text-muted-foreground transition group-open:rotate-180"
        />
      </summary>
      <div className="mt-3">
        <FocusTimer />
      </div>
    </details>
  );
}

export function HomeSidebar({ shortcuts }: HomeSidebarProps) {
  const { isModuleEnabled } = useModulePreferences();

  return (
    <aside className="grid gap-5 xl:sticky xl:top-24">
      <DailyQuoteCard />
      {isModuleEnabled("investments") ? (
        <InvestmentWatchlist assets={investmentAssets} />
      ) : null}
      <TopShortcuts shortcuts={shortcuts} variant="sidebar" />
      {isModuleEnabled("focus") ? <FoldedFocusTimer /> : null}
    </aside>
  );
}
