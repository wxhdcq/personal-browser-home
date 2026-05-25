"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStooqQuotesForAssets } from "@/core/market/stooq";
import type { InvestmentAsset, InvestmentQuote } from "@/types/home";

interface MarketApiResponse {
  quotes?: Record<string, InvestmentQuote>;
  error?: string;
}

type MarketStatus = "loading" | "success" | "error";
type MarketProvider = "web-api" | "extension-client";

const marketProvider: MarketProvider =
  process.env.NEXT_PUBLIC_APP_TARGET === "extension"
    ? "extension-client"
    : "web-api";

async function fetchWebMarketQuotes(forceRefresh = false) {
  const response = await fetch(
    `/api/market${forceRefresh ? `?refresh=${Date.now()}` : ""}`,
  );
  const data = (await response.json()) as MarketApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "行情数据加载失败");
  }

  return data.quotes ?? {};
}

async function fetchExtensionMarketQuotes(assets: InvestmentAsset[]) {
  if (
    typeof window === "undefined" ||
    !["chrome-extension:", "extension:"].includes(window.location.protocol)
  ) {
    return {};
  }

  return fetchStooqQuotesForAssets(assets, { cache: "no-store" });
}

async function fetchMarketQuotes(
  assets: InvestmentAsset[],
  forceRefresh = false,
) {
  if (marketProvider === "extension-client") {
    return fetchExtensionMarketQuotes(assets);
  }

  return fetchWebMarketQuotes(forceRefresh);
}

export function useMarketQuotes(assets: InvestmentAsset[]) {
  const [quotes, setQuotes] = useState<Record<string, InvestmentQuote>>({});
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      try {
        const nextQuotes = await fetchMarketQuotes(assets);
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
  }, [assets]);

  async function refresh() {
    setStatus("loading");
    setError("");

    try {
      const nextQuotes = await fetchMarketQuotes(assets, true);
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
    provider: marketProvider,
    refresh,
    status,
  };
}
