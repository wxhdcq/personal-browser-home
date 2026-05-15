"use client";

import { QuickNotePanel } from "@/components/QuickNotePanel";
import { TodoPanel } from "@/components/TodoPanel";
import { WeatherCard } from "@/components/WeatherCard";
import { useModulePreferences } from "@/hooks/useModulePreferences";

export function HomeDashboard() {
  const { isModuleEnabled } = useModulePreferences();

  return (
    <section className="grid gap-5 lg:grid-cols-3">
      {isModuleEnabled("todos") ? <TodoPanel /> : null}
      {isModuleEnabled("quick-note") ? <QuickNotePanel /> : null}
      {isModuleEnabled("weather") ? <WeatherCard /> : null}
    </section>
  );
}
