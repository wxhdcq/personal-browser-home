"use client";

import {
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
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
        : market.provider === "extension-client"
          ? "扩展客户端"
          : "Stooq 延迟";

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">市场概览</h2>
          <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
            {sourceLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={market.refresh}
          className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-sm font-medium text-primary transition hover:bg-background"
          aria-label="刷新市场数据"
          title="刷新"
        >
          <span className="sm:hidden">查看全部</span>
          {market.status === "loading" ? (
            <LoaderCircle aria-hidden size={16} className="animate-spin" />
          ) : (
            <>
              <RefreshCw aria-hidden size={16} className="hidden sm:block" />
              <ChevronRight aria-hidden size={16} className="sm:hidden" />
            </>
          )}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 sm:mt-5 sm:block sm:space-y-4">
        {market.assets.map((asset) => (
          <div
            key={asset.symbol}
            className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[1fr_90px_74px] sm:gap-3"
          >
            <span className="truncate text-xs text-foreground sm:text-sm">
              {asset.symbol}
            </span>
            <span className="truncate text-right font-mono text-xs text-foreground sm:text-sm">
              {asset.quote.priceLabel}
            </span>
            <span
              className={[
                "inline-flex items-center justify-end gap-1 font-mono text-xs sm:text-sm",
                trendClass(asset.quote.trend),
              ].join(" ")}
            >
              {asset.quote.trend === "down" ? (
                <TrendingDown aria-hidden size={13} />
              ) : (
                <TrendingUp aria-hidden size={13} />
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
