"use client";

import { ChevronRight, Star } from "lucide-react";
import { investmentAssets } from "@/data/investments";
import { useModulePreferences } from "@/hooks/useModulePreferences";
import { InvestmentWatchlist } from "@/components/InvestmentWatchlist";
import { QuickNotePanel } from "@/components/QuickNotePanel";
import { SurfaceCard } from "@/components/SurfaceCard";
import { WeatherCard } from "@/components/WeatherCard";

function ReadingCard() {
  const books = [
    { title: "如何阅读一本书", rating: "9.0", tone: "from-amber-100 to-stone-200" },
    { title: "原则", rating: "8.7", tone: "from-slate-100 to-slate-300" },
    { title: "深度工作", rating: "8.6", tone: "from-blue-50 to-slate-200" },
  ];

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">推荐阅读</h2>
        <button
          className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          type="button"
        >
          查看全部
          <ChevronRight aria-hidden size={16} />
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {books.map((book, index) => (
          <div key={book.title} className="flex items-center gap-3">
            <span className="flex h-12 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-50 to-stone-100 text-xs font-semibold text-slate-600">
              {index + 1}
            </span>
            <span
              className={[
                "h-10 w-8 rounded-md bg-gradient-to-br shadow-sm",
                book.tone,
              ].join(" ")}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {book.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                值得反复阅读
              </span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-warning">
              {book.rating}
              <Star aria-hidden size={16} className="fill-warning" />
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
