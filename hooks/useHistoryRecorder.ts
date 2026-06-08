"use client";

import { useCallback } from "react";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";
import { createId } from "@/core/utils/id";
import { defaultSettings } from "@/data/settings";
import { storageKeys } from "@/data/storageKeys";
import type { HistoryEntry } from "@/types/home";

function readHistory() {
  try {
    return JSON.parse(
      localStorageAdapter.getItemSync(storageKeys.history) ?? "[]",
    ) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function useHistoryRecorder() {
  return useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    try {
      const settings = JSON.parse(
        localStorageAdapter.getItemSync(storageKeys.settings) ??
          JSON.stringify(defaultSettings),
      ) as typeof defaultSettings;

      if (!settings.enableHistoryCapture) {
        return;
      }

      const nextEntry: HistoryEntry = {
        ...entry,
        id: createId(),
        createdAt: new Date().toISOString(),
      };
      const history = readHistory();
      void localStorageAdapter.setItem(
        storageKeys.history,
        JSON.stringify([nextEntry, ...history].slice(0, 200)),
      );
    } catch {
      // History capture should never block navigation.
    }
  }, []);
}
