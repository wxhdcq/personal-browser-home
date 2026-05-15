"use client";

import { Quote, RefreshCw } from "lucide-react";
import { SurfaceCard } from "@/components/SurfaceCard";

interface DailyQuoteCardProps {
  variant?: "full" | "compact";
}

export function DailyQuoteCard({ variant = "full" }: DailyQuoteCardProps) {
  if (variant === "compact") {
    return (
      <SurfaceCard className="min-h-[218px]">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Quote aria-hidden size={21} className="fill-primary text-primary" />
          每日一句
        </h2>
        <p className="mt-8 text-base leading-8 text-foreground">
          你所看到的惊艳，都曾被平庸历练。
        </p>
        <p className="mt-5 text-right text-sm text-muted-foreground">—— 佚名</p>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">每日一句</h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary"
          aria-label="刷新每日一句"
          title="刷新"
        >
          <RefreshCw aria-hidden size={16} />
        </button>
      </div>
      <p className="mt-4 text-4xl leading-none text-slate-200 dark:text-slate-600">
        “
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground sm:text-base sm:leading-7">
        你所看到的惊艳，都曾被平庸历练。
      </p>
      <p className="mt-4 text-right text-sm text-muted-foreground">—— 佚名</p>
    </SurfaceCard>
  );
}
