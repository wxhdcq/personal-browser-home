"use client";

import { shortcuts } from "@/data/shortcuts";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { BookmarkItem, ShortcutLink } from "@/types/home";

const defaultTimestamp = "2026-05-16T00:00:00.000Z";

export function toManagedShortcutItems(items: ShortcutLink[]): BookmarkItem[] {
  return items.map((shortcut) => ({
    ...shortcut,
    createdAt: defaultTimestamp,
    updatedAt: defaultTimestamp,
  }));
}

export function useManagedShortcuts() {
  return useLocalStorage<BookmarkItem[]>(
    storageKeys.shortcuts,
    toManagedShortcutItems(shortcuts),
  );
}
