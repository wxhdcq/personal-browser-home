import type { InvestmentAsset, InvestmentQuote, InvestmentTrend } from "@/types/home";

export interface StooqQuote {
  symbol?: string;
  date?: string;
  time?: string;
  close?: number | string;
  previous?: number | string;
}

export interface StooqResponse {
  symbols?: StooqQuote[];
}

type FetchOptions = RequestInit & {
  next?: {
    revalidate?: number;
  };
};

function toNumber(value: number | string | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function trendFromChange(changePercent: number): InvestmentTrend {
  if (changePercent > 0.005) return "up";
  if (changePercent < -0.005) return "down";
  return "flat";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatChange(changePercent: number) {
  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
}

function buildQuote(item: StooqQuote): InvestmentQuote | undefined {
  const close = toNumber(item.close);
  const previous = toNumber(item.previous);

  if (close === undefined || previous === undefined || previous === 0) {
    return undefined;
  }

  const changePercent = ((close - previous) / previous) * 100;

  return {
    priceLabel: formatPrice(close),
    changeLabel: formatChange(changePercent),
    trend: trendFromChange(changePercent),
    asOf: [item.date, item.time].filter(Boolean).join(" "),
    source: "stooq",
  };
}

export function buildStooqUrl(symbols: string[]) {
  const url = new URL("https://stooq.com/q/l/");
  url.searchParams.set("s", symbols.join(" "));
  url.searchParams.set("f", "sd2t2cp");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "json");
  return url;
}

export function parseStooqQuotes(
  data: StooqResponse,
  assets: InvestmentAsset[],
) {
  const quotes: Record<string, InvestmentQuote> = {};

  data.symbols?.forEach((item) => {
    if (!item.symbol) return;

    const asset = assets.find(
      (currentAsset) =>
        currentAsset.stooqSymbol?.toLowerCase() === item.symbol?.toLowerCase(),
    );
    const quote = buildQuote(item);

    if (asset && quote) {
      quotes[asset.symbol] = quote;
    }
  });

  return quotes;
}

export async function fetchStooqQuotesForAssets(
  assets: InvestmentAsset[],
  options?: FetchOptions,
) {
  const symbols = assets
    .map((asset) => asset.stooqSymbol)
    .filter((symbol): symbol is string => Boolean(symbol));

  if (symbols.length === 0) return {};

  const response = await fetch(buildStooqUrl(symbols), options);

  if (!response.ok) {
    throw new Error("Stooq market service is temporarily unavailable");
  }

  const data = (await response.json()) as StooqResponse;
  return parseStooqQuotes(data, assets);
}
