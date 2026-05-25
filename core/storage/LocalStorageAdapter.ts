"use client";

import {
  StorageChangeDetail,
  storageChangeEvent,
  SyncStorageAdapter,
} from "@/core/storage/StorageAdapter";

const memoryStorage = new Map<string, string>();

function emitStorageChange(key?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(storageChangeEvent, {
      detail: { key },
    }),
  );
}

export class LocalStorageAdapter implements SyncStorageAdapter {
  getItemSync(key: string) {
    if (typeof window === "undefined") {
      return memoryStorage.get(key) ?? null;
    }

    try {
      return window.localStorage.getItem(key) ?? memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  }

  async getItem(key: string) {
    return this.getItemSync(key);
  }

  async setItem(key: string, value: string) {
    memoryStorage.set(key, value);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Keep memoryStorage as a fallback when persistence is blocked.
      }
    }

    emitStorageChange(key);
  }

  async removeItem(key: string) {
    memoryStorage.delete(key);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Nothing else to do; memoryStorage is already cleared.
      }
    }

    emitStorageChange(key);
  }

  async getItems(keys: string[]) {
    const entries = await Promise.all(
      keys.map(async (key) => [key, await this.getItem(key)] as const),
    );

    return Object.fromEntries(entries);
  }

  async setItems(items: Record<string, string | null>) {
    await Promise.all(
      Object.entries(items).map(([key, value]) =>
        value === null ? this.removeItem(key) : this.setItem(key, value),
      ),
    );

    emitStorageChange();
  }

  subscribe(key: string | null, callback: () => void) {
    if (typeof window === "undefined") return () => undefined;

    function handleCustomStorageChange(event: Event) {
      if (event instanceof CustomEvent) {
        const detail = event.detail as StorageChangeDetail | undefined;
        if (key && detail?.key && detail.key !== key) return;
      }

      callback();
    }

    function handleNativeStorageChange(event: StorageEvent) {
      if (!key || event.key === key) callback();
    }

    window.addEventListener(storageChangeEvent, handleCustomStorageChange);
    window.addEventListener("storage", handleNativeStorageChange);

    return () => {
      window.removeEventListener(storageChangeEvent, handleCustomStorageChange);
      window.removeEventListener("storage", handleNativeStorageChange);
    };
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
