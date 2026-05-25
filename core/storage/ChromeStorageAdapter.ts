import type {
  StorageAdapter,
  StorageChangeDetail,
} from "@/core/storage/StorageAdapter";
import { storageChangeEvent } from "@/core/storage/StorageAdapter";

type ChromeStorageAreaName = "local" | "sync";
type ChromeStorageValue = string | null;

interface ChromeRuntime {
  lastError?: {
    message?: string;
  };
}

interface ChromeStorageArea {
  get(
    keys: string | string[] | Record<string, unknown> | null,
    callback: (items: Record<string, unknown>) => void,
  ): void;
  set(items: Record<string, unknown>, callback?: () => void): void;
  remove(keys: string | string[], callback?: () => void): void;
}

interface ChromeStorageChange {
  oldValue?: unknown;
  newValue?: unknown;
}

interface ChromeStorageApi {
  local?: ChromeStorageArea;
  sync?: ChromeStorageArea;
  onChanged?: {
    addListener(
      callback: (
        changes: Record<string, ChromeStorageChange>,
        areaName: ChromeStorageAreaName,
      ) => void,
    ): void;
    removeListener(
      callback: (
        changes: Record<string, ChromeStorageChange>,
        areaName: ChromeStorageAreaName,
      ) => void,
    ): void;
  };
}

interface ChromeLike {
  runtime?: ChromeRuntime;
  storage?: ChromeStorageApi;
}

const memoryStorage = new Map<string, string>();

function getChrome() {
  return (globalThis as typeof globalThis & { chrome?: ChromeLike }).chrome;
}

function getChromeError() {
  const message = getChrome()?.runtime?.lastError?.message;
  return message ? new Error(message) : null;
}

function emitStorageChange(key?: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<StorageChangeDetail>(storageChangeEvent, {
      detail: { key },
    }),
  );
}

function normalizeStoredValue(value: unknown): ChromeStorageValue {
  if (value === null || typeof value === "string") return value;
  return null;
}

export class ChromeStorageAdapter implements StorageAdapter {
  constructor(private readonly areaName: ChromeStorageAreaName = "local") {}

  private get area() {
    return getChrome()?.storage?.[this.areaName];
  }

  async getItem(key: string) {
    const area = this.area;

    if (!area) {
      return memoryStorage.get(key) ?? null;
    }

    return new Promise<string | null>((resolve, reject) => {
      area.get(key, (items) => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve(normalizeStoredValue(items[key]));
      });
    });
  }

  async setItem(key: string, value: string) {
    memoryStorage.set(key, value);
    const area = this.area;

    if (!area) {
      emitStorageChange(key);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      area.set({ [key]: value }, () => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    emitStorageChange(key);
  }

  async removeItem(key: string) {
    memoryStorage.delete(key);
    const area = this.area;

    if (!area) {
      emitStorageChange(key);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      area.remove(key, () => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    emitStorageChange(key);
  }

  async getItems(keys: string[]) {
    const area = this.area;

    if (!area) {
      return Object.fromEntries(
        keys.map((key) => [key, memoryStorage.get(key) ?? null]),
      );
    }

    return new Promise<Record<string, string | null>>((resolve, reject) => {
      area.get(keys, (items) => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve(
          Object.fromEntries(
            keys.map((key) => [key, normalizeStoredValue(items[key])]),
          ),
        );
      });
    });
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

    const areaName = this.areaName;

    function handleCustomStorageChange(event: Event) {
      if (event instanceof CustomEvent) {
        const detail = event.detail as StorageChangeDetail | undefined;
        if (key && detail?.key && detail.key !== key) return;
      }

      callback();
    }

    function handleChromeStorageChange(
      changes: Record<string, ChromeStorageChange>,
      changedAreaName: ChromeStorageAreaName,
    ) {
      if (changedAreaName !== areaName) return;
      if (key && !(key in changes)) return;
      callback();
    }

    const chromeStorage = getChrome()?.storage;

    window.addEventListener(storageChangeEvent, handleCustomStorageChange);
    chromeStorage?.onChanged?.addListener(handleChromeStorageChange);

    return () => {
      window.removeEventListener(storageChangeEvent, handleCustomStorageChange);
      chromeStorage?.onChanged?.removeListener(handleChromeStorageChange);
    };
  }
}

export const chromeStorageAdapter = new ChromeStorageAdapter("local");
