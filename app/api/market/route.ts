import { NextResponse, type NextRequest } from "next/server";
import { fetchStooqQuotesForAssets } from "@/core/market/stooq";
import { investmentAssets } from "@/data/investments";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  try {
    const shouldRefresh = request.nextUrl.searchParams.has("refresh");
    const quotes = await fetchStooqQuotesForAssets(
      investmentAssets,
      shouldRefresh ? { cache: "no-store" } : { next: { revalidate: 60 } },
    );

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
  } catch {
    return NextResponse.json(
      {
        error: "Stooq 行情服务暂时不可用",
        quotes: {},
        source: "stooq",
      },
      { status: 502 },
    );
  }
}
