"use client";

import { useModulePreferences } from "@/hooks/useModulePreferences";
import { FocusTimer } from "@/components/FocusTimer";
import { ShortcutGrid } from "@/components/ShortcutGrid";
import { TodoPanel } from "@/components/TodoPanel";
import type { ShortcutLink } from "@/types/home";

interface HomeDashboardProps {
  shortcuts: ShortcutLink[];
}

export function HomeDashboard({ shortcuts }: HomeDashboardProps) {
  const { isModuleEnabled } = useModulePreferences();

  return (
    <div className="grid gap-8">
      <ShortcutGrid shortcuts={shortcuts} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)]">
        {isModuleEnabled("todos") ? <TodoPanel /> : null}
        {isModuleEnabled("focus") ? <FocusTimer /> : null}
      </div>
    </div>
  );
}
