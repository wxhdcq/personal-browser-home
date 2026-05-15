"use client";

import { useMemo, useSyncExternalStore } from "react";

const emptyClockSnapshot = 0;

function subscribeToClock(callback: () => void) {
  const timer = window.setInterval(callback, 60_000);
  return () => window.clearInterval(timer);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 60_000);
}

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 6) return "夜深了";
  if (hour < 12) return "早安";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function ClockGreeting() {
  const timestamp = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    () => emptyClockSnapshot,
  );

  const current = useMemo(() => {
    const now = timestamp ? new Date(timestamp * 60_000) : new Date();
    return {
      greeting: getGreeting(now),
      date: formatDate(now),
    };
  }, [timestamp]);

  return (
    <section className="text-center">
      <h1 className="text-[30px] font-bold leading-tight tracking-normal text-foreground sm:text-4xl">
        {current.greeting}，今天也要元气满满哦！
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
        {current.date} · 保持好奇，保持学习，保持成长。
      </p>
    </section>
  );
}
