"use client";

import { Pause, Play, RotateCcw, Settings } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";

const focusSeconds = 25 * 60;

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function FocusTimer() {
  const [remaining, setRemaining] = useState(focusSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running]);

  const label = useMemo(() => formatSeconds(remaining), [remaining]);

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">专注计时器</h2>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
          aria-label="专注设置"
          title="设置"
        >
          <Settings aria-hidden size={17} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-full bg-background p-1 text-sm text-muted-foreground">
        <span className="rounded-full bg-card py-2 text-center font-medium text-foreground shadow-sm">
          番茄钟
        </span>
        <span className="py-2 text-center">倒计时</span>
      </div>

      <p className="mt-8 text-center font-mono text-5xl font-semibold tracking-normal text-foreground">
        {label}
      </p>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-strong"
        >
          {running ? <Pause aria-hidden size={18} /> : <Play aria-hidden size={18} />}
          {running ? "暂停" : "开始"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRemaining(focusSeconds);
            setRunning(false);
          }}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          aria-label="重置计时器"
          title="重置"
        >
          <RotateCcw aria-hidden size={17} />
        </button>
      </div>
    </SurfaceCard>
  );
}
