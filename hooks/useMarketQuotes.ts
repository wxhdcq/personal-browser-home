"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

async function fetchWebMarketQuotes(forceRefresh = false, signal?: AbortSignal) {
  const response = await fetch(
    `/api/market${forceRefresh ? `?refresh=${Date.now()}` : ""}`,
    { signal },
  );
  const data = (await response.json()) as MarketApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "行情数据加载失败");
  }

  return data.quotes ?? {};
}

async function fetchExtensionMarketQuotes(
  assets: InvestmentAsset[],
  signal?: AbortSignal,
) {
  if (
    typeof window === "undefined" ||
    !["chrome-extension:", "extension:"].includes(window.location.protocol)
  ) {
    return {};
  }

  return fetchStooqQuotesForAssets(assets, { cache: "no-store", signal });
}

async function fetchMarketQuotes(
  assets: InvestmentAsset[],
  forceRefresh = false,
  signal?: AbortSignal,
) {
  if (marketProvider === "extension-client") {
    return fetchExtensionMarketQuotes(assets, signal);
  }

  return fetchWebMarketQuotes(forceRefresh, signal);
}

export function useMarketQuotes(assets: InvestmentAsset[]) {
  const [quotes, setQuotes] = useState<Record<string, InvestmentQuote>>({});
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [error, setError] = useState("");
  const refreshAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadQuotes() {
      try {
        const nextQuotes = await fetchMarketQuotes(
          assets,
          false,
          controller.signal,
        );
        if (cancelled) return;
        setQuotes(nextQuotes);
        setStatus("success");
        setError("");
      } catch (loadError) {
        if (isAbortError(loadError)) return;
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
      controller.abort();
      refreshAbortRef.current?.abort();
    };
  }, [assets]);

  const refresh = useCallback(async () => {
    refreshAbortRef.current?.abort();
    const controller = new AbortController();
    refreshAbortRef.current = controller;

    setStatus("loading");
    setError("");

    try {
      const nextQuotes = await fetchMarketQuotes(
        assets,
        true,
        controller.signal,
      );
      setQuotes(nextQuotes);
      setStatus("success");
    } catch (refreshError) {
      if (isAbortError(refreshError)) return;
      setStatus("error");
      setError(
        refreshError instanceof Error ? refreshError.message : "行情数据刷新失败",
      );
    } finally {
      if (refreshAbortRef.current === controller) {
        refreshAbortRef.current = null;
      }
    }
  }, [assets]);

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
