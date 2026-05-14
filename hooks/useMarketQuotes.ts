"use client";

import { useEffect, useMemo, useState } from "react";
import type { InvestmentAsset, InvestmentQuote } from "@/types/home";

interface MarketApiResponse {
  quotes?: Record<string, InvestmentQuote>;
  error?: string;
}

type MarketStatus = "loading" | "success" | "error";

async function fetchMarketQuotes(forceRefresh = false) {
  const response = await fetch(
    `/api/market${forceRefresh ? `?refresh=${Date.now()}` : ""}`,
  );
  const data = (await response.json()) as MarketApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "行情数据加载失败");
  }

  return data.quotes ?? {};
}

export function useMarketQuotes(assets: InvestmentAsset[]) {
  const [quotes, setQuotes] = useState<Record<string, InvestmentQuote>>({});
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      try {
        const nextQuotes = await fetchMarketQuotes();
        if (cancelled) return;
        setQuotes(nextQuotes);
        setStatus("success");
        setError("");
      } catch (loadError) {
        if (cancelled) return;
        setStatus("error");
        setError(
          loadError instanceof Error ? loadError.message : "行情数据加载失败",
        );
      }
    }

    void loadQuotes();

    return () => {
      cancelled = true;
    };
  }, []);

  async function refresh() {
    setStatus("loading");
    setError("");

    try {
      const nextQuotes = await fetchMarketQuotes(true);
      setQuotes(nextQuotes);
      setStatus("success");
    } catch (refreshError) {
      setStatus("error");
      setError(
        refreshError instanceof Error ? refreshError.message : "行情数据刷新失败",
      );
    }
  }

  const assetsWithQuotes = useMemo(
    () =>
      assets.map((asset) => ({
        ...asset,
        quote: quotes[asset.symbol] ?? asset.quote,
      })),
    [assets, quotes],
  );

  return {
    assets: assetsWithQuotes,
    error,
    refresh,
    status,
  };
}
