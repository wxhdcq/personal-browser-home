"use client";

import { RefreshCw } from "lucide-react";
import { investmentAssets } from "@/data/investments";
import { useModulePreferences } from "@/hooks/useModulePreferences";
import { InvestmentWatchlist } from "@/components/InvestmentWatchlist";
import { QuickNotePanel } from "@/components/QuickNotePanel";
import { SurfaceCard } from "@/components/SurfaceCard";
import { WeatherCard } from "@/components/WeatherCard";

export function DailyQuoteCard() {
  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">每日一句</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary"
          aria-label="刷新每日一句"
          title="刷新"
        >
          <RefreshCw aria-hidden size={16} />
        </button>
      </div>
      <p className="mt-5 text-4xl leading-none text-slate-200">“</p>
      <p className="mt-1 text-base leading-7 text-foreground">
        你所看到的惊艳，都曾被平庸历练。
      </p>
      <p className="mt-5 text-right text-sm text-muted-foreground">—— 佚名</p>
    </SurfaceCard>
  );
}

function ReadingCard() {
  const books = [
    ["如何阅读一本书", "9.0"],
    ["原则", "8.7"],
    ["深度工作", "8.6"],
  ];

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">推荐阅读</h2>
        <button className="text-sm font-medium text-primary" type="button">
          查看全部
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {books.map(([title, rating], index) => (
          <div key={title} className="flex items-center gap-3">
            <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-100 to-slate-200 text-xs font-semibold text-slate-600">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                值得反复阅读
              </span>
            </span>
            <span className="font-mono text-sm font-semibold text-warning">
              {rating}
            </span>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

export function HomeSidebar() {
  const { isModuleEnabled } = useModulePreferences();

  return (
    <aside className="grid gap-6">
      {isModuleEnabled("investments") ? (
        <InvestmentWatchlist assets={investmentAssets} />
      ) : null}
      <ReadingCard />
      {isModuleEnabled("quick-note") ? <QuickNotePanel /> : null}
      {isModuleEnabled("weather") ? <WeatherCard /> : null}
    </aside>
  );
}
