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
  if (hour < 12) return "早上好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export function ClockGreeting() {
  const timestamp = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    () => emptyClockSnapshot,
  );

  const greeting = useMemo(() => {
    if (!timestamp) return "你好";
    const now = new Date(timestamp * 60_000);
    return getGreeting(now);
  }, [timestamp]);

  return (
    <section className="text-center">
      <h1 className="text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
        {greeting}，专注让今天变得更有意义
      </h1>
      <p className="mt-5 text-base text-muted-foreground">
        保持好奇，保持学习，保持成长。
      </p>
    </section>
  );
}
