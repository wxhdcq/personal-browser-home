import { NextResponse, type NextRequest } from "next/server";
import { investmentAssets } from "@/data/investments";
import type { InvestmentQuote, InvestmentTrend } from "@/types/home";

export const dynamic = "force-dynamic";

interface StooqQuote {
  symbol?: string;
  date?: string;
  time?: string;
  close?: number | string;
  previous?: number | string;
}

interface StooqResponse {
  symbols?: StooqQuote[];
}

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

export async function GET(request: NextRequest) {
  const symbols = investmentAssets
    .map((asset) => asset.stooqSymbol)
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {}, source: "stooq" });
  }

  const url = new URL("https://stooq.com/q/l/");
  url.searchParams.set("s", symbols.join(" "));
  url.searchParams.set("f", "sd2t2cp");
  url.searchParams.set("h", "");
  url.searchParams.set("e", "json");

  const shouldRefresh = request.nextUrl.searchParams.has("refresh");
  const response = await fetch(
    url,
    shouldRefresh ? { cache: "no-store" } : { next: { revalidate: 60 } },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Stooq 行情服务暂时不可用", quotes: {}, source: "stooq" },
      { status: 502 },
    );
  }

  const data = (await response.json()) as StooqResponse;
  const quotes: Record<string, InvestmentQuote> = {};

  data.symbols?.forEach((item) => {
    if (!item.symbol) return;

    const asset = investmentAssets.find(
      (currentAsset) =>
        currentAsset.stooqSymbol?.toLowerCase() === item.symbol?.toLowerCase(),
    );
    const quote = buildQuote(item);

    if (asset && quote) {
      quotes[asset.symbol] = quote;
    }
  });

  return NextResponse.json(
    {
      fetchedAt: new Date().toISOString(),
      quotes,
      source: "stooq",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
