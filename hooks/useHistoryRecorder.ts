"use client";

import { useCallback } from "react";
import { defaultSettings } from "@/data/settings";
import { storageKeys } from "@/data/storageKeys";
import type { HistoryEntry } from "@/types/home";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function readHistory() {
  try {
    return JSON.parse(
      window.localStorage.getItem(storageKeys.history) ?? "[]",
    ) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function useHistoryRecorder() {
  return useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    try {
      const settings = JSON.parse(
        window.localStorage.getItem(storageKeys.settings) ??
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
      window.localStorage.setItem(
        storageKeys.history,
        JSON.stringify([nextEntry, ...history].slice(0, 200)),
      );
      window.dispatchEvent(
        new CustomEvent("personal-home.local-storage-change", {
          detail: { key: storageKeys.history },
        }),
      );
    } catch {
      // History capture should never block navigation.
    }
  }, []);
}
