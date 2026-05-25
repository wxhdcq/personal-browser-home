"use client";

import { useSyncExternalStore } from "react";
import { ClockGreeting } from "@/components/ClockGreeting";
import { HomeDashboard } from "@/components/HomeDashboard";
import { HomeSidebar } from "@/components/HomeSidebar";
import { MobileHome } from "@/components/MobileHome";
import { SearchBox } from "@/components/SearchBox";
import { UtilityLinksCard } from "@/components/UtilityLinksCard";
import { useManagedSearchEngines } from "@/hooks/useManagedSearchEngines";
import { useManagedShortcuts } from "@/hooks/useManagedShortcuts";
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
  const [managedShortcuts] = useManagedShortcuts();
  const [managedSearchEngines] = useManagedSearchEngines();
  const visibleShortcuts =
    managedShortcuts.length > 0 ? managedShortcuts : shortcuts;
  const visibleSearchEngines =
    managedSearchEngines.length > 0 ? managedSearchEngines : engines;
  const isMobile = useSyncExternalStore(
    subscribeToMobile,
    getMobileSnapshot,
    () => false,
  );

  if (isMobile) {
    return (
      <MobileHome engines={visibleSearchEngines} shortcuts={visibleShortcuts} />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      <div className="grid items-start gap-6 pt-3 min-[1320px]:grid-cols-[minmax(0,1fr)_360px] min-[1536px]:gap-8 min-[1536px]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          <section className="pt-2 min-[1320px]:pt-3">
            <ClockGreeting />
            <div className="mt-7">
              <SearchBox
                engines={visibleSearchEngines}
                className="max-w-[900px]"
              />
            </div>
          </section>

          <div className="mt-8">
            <HomeDashboard />
          </div>
          <div className="mt-5">
            <UtilityLinksCard />
          </div>
        </div>

        <HomeSidebar shortcuts={visibleShortcuts} />
      </div>
    </div>
  );
}
