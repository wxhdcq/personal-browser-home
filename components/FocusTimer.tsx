"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurfaceCard } from "@/components/SurfaceCard";

const focusSeconds = 25 * 60;
let sharedAudioContext: AudioContext | null = null;

function formatSeconds(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

function showCompletionNotification() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification("专注完成", {
    body: "25 分钟已经结束，可以休息一下了。",
  });
}

function getAudioContext() {
  if (typeof window === "undefined" || !window.AudioContext) return null;

  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new window.AudioContext();
  }

  return sharedAudioContext;
}

function playCompletionSound() {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.55);
}

export function FocusTimer() {
  const [remaining, setRemaining] = useState(focusSeconds);
  const [running, setRunning] = useState(false);
  const notifiedRef = useRef(false);

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

  useEffect(() => {
    if (remaining > 0) {
      notifiedRef.current = false;
      return;
    }

    if (running || notifiedRef.current) return;

    notifiedRef.current = true;
    playCompletionSound();
    showCompletionNotification();
  }, [remaining, running]);

  const label = useMemo(() => formatSeconds(remaining), [remaining]);

  function toggleRunning() {
    if (!running) {
      if (remaining === 0) {
        setRemaining(focusSeconds);
      }
      void requestNotificationPermission();
    }

    setRunning((current) => !current);
  }

  function resetTimer() {
    notifiedRef.current = false;
    setRemaining(focusSeconds);
    setRunning(false);
  }

  return (
    <SurfaceCard>
      <h2 className="text-lg font-semibold text-foreground">专注计时器</h2>

      <p className="mt-8 text-center font-mono text-5xl font-semibold tracking-normal text-foreground">
        {label}
      </p>

      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleRunning}
          className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-strong"
        >
          {running ? <Pause aria-hidden size={18} /> : <Play aria-hidden size={18} />}
          {running ? "暂停" : "开始"}
        </button>
        <button
          type="button"
          onClick={resetTimer}
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
