"use client";

import { Quote, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";
import { storageKeys } from "@/data/storageKeys";

interface DailyQuoteCardProps {
  variant?: "full" | "compact";
}

interface QuoteEntry {
  text: string;
  author: string;
  source: "local" | "hitokoto";
}

interface CachedDailyQuote {
  date: string;
  quote: QuoteEntry;
}

interface HitokotoResponse {
  hitokoto?: string;
  from?: string;
  from_who?: string | null;
  creator?: string;
}

const quotes: QuoteEntry[] = [
  { text: "你所看到的惊艳，都曾被平庸历练。", author: "佚名" },
  { text: "所有的坚持，终将美好。", author: "佚名" },
  { text: "把每一天当作新的开始，而不是终点。", author: "佚名" },
  { text: "学如逆水行舟，不进则退。", author: "《增广贤文》" },
  { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原" },
  { text: "千里之行，始于足下。", author: "老子" },
  { text: "博学之，审问之，慎思之，明辨之，笃行之。", author: "《礼记》" },
  { text: "不积跬步，无以至千里。", author: "荀子" },
].map((quote) => ({ ...quote, source: "local" }));

const quoteHydrationDelayMs = 800;

function todayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
  }).format(new Date());
}

function readCachedQuote() {
  try {
    const cached = JSON.parse(
      localStorageAdapter.getItemSync(storageKeys.dailyQuote) ?? "null",
    ) as CachedDailyQuote | null;

    return cached?.date === todayKey() ? cached.quote : undefined;
  } catch {
    return undefined;
  }
}

function writeCachedQuote(quote: QuoteEntry) {
  try {
    void localStorageAdapter.setItem(
      storageKeys.dailyQuote,
      JSON.stringify({ date: todayKey(), quote }),
    );
  } catch {
    // Fallback quotes still work if storage is blocked.
  }
}

function normalizeRemoteQuote(data: HitokotoResponse) {
  const text = data.hitokoto?.trim();
  if (!text) return undefined;

  return {
    text,
    author:
      data.from_who?.trim() ||
      data.from?.trim() ||
      data.creator?.trim() ||
      "一言",
    source: "hitokoto" as const,
  };
}

async function fetchRemoteQuote(signal?: AbortSignal) {
  const url = new URL("https://v1.hitokoto.cn/");
  url.searchParams.set("encode", "json");
  url.searchParams.set("max_length", "42");
  url.searchParams.append("c", "d");
  url.searchParams.append("c", "i");
  url.searchParams.append("c", "k");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("每日一句加载失败");

  return normalizeRemoteQuote((await response.json()) as HitokotoResponse);
}

function pickDailyQuote() {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return quotes[dayIndex % quotes.length];
}

function pickRandomQuote(currentText: string) {
  if (quotes.length <= 1) return quotes[0];
  let next: (typeof quotes)[number];
  do {
    next = quotes[Math.floor(Math.random() * quotes.length)];
  } while (next.text === currentText);
  return next;
}

export function DailyQuoteCard({ variant = "full" }: DailyQuoteCardProps) {
  const [quote, setQuote] = useState<QuoteEntry>(() => pickDailyQuote());

  const loadRemoteQuote = useCallback(async (cacheResult: boolean) => {
    const remoteQuote = await fetchRemoteQuote();
    if (!remoteQuote) return;

    setQuote(remoteQuote);
    if (cacheResult) writeCachedQuote(remoteQuote);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;
    const timer = window.setTimeout(() => {
      const cachedQuote = readCachedQuote();

      if (cachedQuote) {
        if (!cancelled) setQuote(cachedQuote);
        return;
      }

      controller = new AbortController();
      void fetchRemoteQuote(controller.signal)
        .then((remoteQuote) => {
          if (!remoteQuote || cancelled) return;
          setQuote(remoteQuote);
          writeCachedQuote(remoteQuote);
        })
        .catch(() => undefined);
    }, quoteHydrationDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  function refresh() {
    void loadRemoteQuote(false).catch(() => {
      setQuote((current) => pickRandomQuote(current.text));
    });
  }

  if (variant === "compact") {
    return (
      <SurfaceCard className="min-h-[218px]">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Quote aria-hidden size={21} className="fill-primary text-primary" />
          {"每日一句"}
        </h2>
        <p className="mt-8 text-base leading-8 text-foreground">
          {quote.text}
        </p>
        <p className="mt-5 text-right text-sm text-muted-foreground">{"—— "}{quote.author}</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{"每日一句"}</h2>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary"
          aria-label={"刷新每日一句"}
          title={"刷新"}
        >
          <RefreshCw aria-hidden size={16} />
        </button>
      </div>
      <p className="mt-4 text-4xl leading-none text-slate-200 dark:text-slate-600">
        {"“"}
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground sm:text-base sm:leading-7">
        {quote.text}
      </p>
      <p className="mt-4 text-right text-sm text-muted-foreground">{"—— "}{quote.author}</p>
    </SurfaceCard>
  );
}
