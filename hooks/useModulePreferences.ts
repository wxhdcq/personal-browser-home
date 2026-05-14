"use client";

import { defaultModules } from "@/data/modules";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ModulePreference } from "@/types/home";

export function useModulePreferences() {
  const [modules, setModules] = useLocalStorage<ModulePreference[]>(
    storageKeys.modulePreferences,
    defaultModules,
  );

  function isModuleEnabled(id: string) {
    return modules.find((module) => module.id === id)?.enabled ?? true;
  }

  return { modules, setModules, isModuleEnabled };
}
