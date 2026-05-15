"use client";

import { useSyncExternalStore } from "react";
import { ClockGreeting } from "@/components/ClockGreeting";
import { DailyQuoteCard } from "@/components/DailyQuoteCard";
import { HomeDashboard } from "@/components/HomeDashboard";
import { HomeSidebar } from "@/components/HomeSidebar";
import { MobileHome } from "@/components/MobileHome";
import { SearchBox } from "@/components/SearchBox";
import type { SearchEngine, ShortcutLink } from "@/types/home";

interface ResponsiveHomeProps {
  engines: SearchEngine[];
  shortcuts: ShortcutLink[];
}

function subscribeToMobile(callback: () => void) {
  const query = window.matchMedia("(max-width: 639px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia("(max-width: 639px)").matches;
}

export function ResponsiveHome({ engines, shortcuts }: ResponsiveHomeProps) {
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    () => false,
  );

  if (isMobile) {
    return (
      <div className="mx-auto max-w-[1450px]">
        <ClockGreeting />
        <MobileHome engines={engines} shortcuts={shortcuts} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1450px]">
      <div className="grid items-start gap-8 pt-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <ClockGreeting />
          <div className="mt-8">
            <SearchBox engines={engines} />
          </div>
          <div className="mt-9">
            <HomeDashboard shortcuts={shortcuts} />
          </div>
        </div>
        <div className="grid gap-6 xl:pt-1">
          <DailyQuoteCard />
          <HomeSidebar />
        </div>
      </div>
      <p className="mt-10 text-center text-sm text-muted-foreground">
        The best way to predict the future is to create it.
        <span className="ml-2">— Peter Drucker</span>
      </p>
    </div>
  );
}
