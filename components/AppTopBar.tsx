"use client";

import { Cloud } from "lucide-react";
import { useSyncExternalStore } from "react";
import { defaultSettings } from "@/data/settings";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWeather } from "@/hooks/useWeather";
import type { UserSettings } from "@/types/home";
import { ThemeToggle } from "@/components/ThemeToggle";

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

function subscribeToDay(callback: () => void) {
  const timer = window.setInterval(callback, 60 * 60 * 1000);
  return () => window.clearInterval(timer);
}

export function AppTopBar() {
  const today = useSyncExternalStore(subscribeToDay, formatToday, () => "今日");
  const [settings] = useLocalStorage<UserSettings>(
    storageKeys.settings,
    defaultSettings,
  );
  const weather = useWeather(settings.weatherLocation);

  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1760px] items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            M
          </span>
          <span className="text-base font-semibold text-foreground">My Home</span>
        </div>

        <div className="flex items-center gap-5 text-sm text-foreground">
          <ThemeToggle />
          <span className="hidden items-center gap-2 sm:inline-flex">
            <Cloud aria-hidden size={18} className="text-muted-foreground" />
            {weather.data
              ? `${Math.round(weather.data.temperature)}°C ${weather.data.weatherText}`
              : "天气加载中"}
          </span>
          <span className="hidden text-muted-foreground sm:inline">
            {today}
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 text-xs font-semibold text-white shadow-sm">
            WX
          </span>
        </div>
      </div>
    </header>
  );
}
