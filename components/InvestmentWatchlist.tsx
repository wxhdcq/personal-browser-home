"use client";

import { LoaderCircle, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import type { InvestmentAsset, InvestmentTrend } from "@/types/home";

interface InvestmentWatchlistProps {
  assets: InvestmentAsset[];
}

function trendClass(trend: InvestmentTrend) {
  if (trend === "up") return "text-success";
  if (trend === "down") return "text-danger";
  return "text-muted-foreground";
}

export function InvestmentWatchlist({ assets }: InvestmentWatchlistProps) {
  const market = useMarketQuotes(assets);
  const sourceLabel =
    market.status === "loading"
      ? "更新中"
      : market.status === "error"
        ? "本地兜底"
        : "Stooq 延迟";

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">市场概览</h2>
          <p className="mt-1 text-xs text-muted-foreground">{sourceLabel}</p>
        </div>
        <button
          type="button"
          onClick={market.refresh}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary"
          aria-label="刷新市场数据"
          title="刷新"
        >
          {market.status === "loading" ? (
            <LoaderCircle aria-hidden size={16} className="animate-spin" />
          ) : (
            <RefreshCw aria-hidden size={16} />
          )}
        </button>
      </div>
      <div className="mt-5 space-y-4">
        {market.assets.map((asset) => (
          <div
            key={asset.symbol}
            className="grid grid-cols-[1fr_90px_74px] items-center gap-3"
          >
            <span className="truncate text-sm text-foreground">{asset.symbol}</span>
            <span className="text-right font-mono text-sm text-foreground">
              {asset.quote.priceLabel}
            </span>
            <span
              className={[
                "inline-flex items-center justify-end gap-1 font-mono text-sm",
                trendClass(asset.quote.trend),
              ].join(" ")}
            >
              {asset.quote.trend === "down" ? (
                <TrendingDown aria-hidden size={14} />
              ) : (
                <TrendingUp aria-hidden size={14} />
              )}
              {asset.quote.changeLabel}
            </span>
          </div>
        ))}
      </div>
      {market.error ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {market.error}，已显示本地静态数据。
        </p>
      ) : null}
    </SurfaceCard>
  );
}
