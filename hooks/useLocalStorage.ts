"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

const localStorageChangeEvent = "personal-home.local-storage-change";
const memoryStorage = new Map<string, string>();

function readStorage(key: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return window.localStorage.getItem(key) ?? memoryStorage.get(key) ?? fallback;
  } catch {
    return memoryStorage.get(key) ?? fallback;
  }
}

function writeStorage(key: string, value: string) {
  memoryStorage.set(key, value);

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory fallback so the UI still works when persistence is blocked.
  }

  window.dispatchEvent(
    new CustomEvent(localStorageChangeEvent, { detail: { key } }),
  );
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, Dispatch<SetStateAction<T>>, boolean] {
  const [initialJson] = useState(() => JSON.stringify(initialValue));

  const getSnapshot = useCallback(
    () => readStorage(key, initialJson),
    [initialJson, key],
  );

  const subscribe = useCallback(
    (callback: () => void) => {
      function handleLocalStorageChange(event: Event) {
        if (
          event instanceof CustomEvent &&
          event.detail &&
          event.detail.key !== key
        ) {
          return;
        }

        callback();
      }

      function handleStorageChange(event: StorageEvent) {
        if (event.key === key) {
          callback();
        }
      }

      window.addEventListener(localStorageChangeEvent, handleLocalStorageChange);
      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener(
          localStorageChangeEvent,
          handleLocalStorageChange,
        );
        window.removeEventListener("storage", handleStorageChange);
      };
    },
    [key],
  );

  const rawValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialJson,
  );

  const value = useMemo(() => {
    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return JSON.parse(initialJson) as T;
    }
  }, [initialJson, rawValue]);

  const setValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      const currentValue = value;
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(currentValue)
          : nextValue;

      writeStorage(key, JSON.stringify(resolvedValue));
    },
    [key, value],
  );

  return [value, setValue, true] as const;
}
