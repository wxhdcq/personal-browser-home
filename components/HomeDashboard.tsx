"use client";

import { QuickNotePanel } from "@/components/QuickNotePanel";
import { TodoPanel } from "@/components/TodoPanel";
import { WeatherCard } from "@/components/WeatherCard";
import { useModulePreferences } from "@/hooks/useModulePreferences";

export function HomeDashboard() {
  const { isModuleEnabled } = useModulePreferences();

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {isModuleEnabled("todos") ? <TodoPanel /> : null}
      {isModuleEnabled("quick-note") ? <QuickNotePanel /> : null}
      {isModuleEnabled("weather") ? <WeatherCard /> : null}
    </section>
  );
}
