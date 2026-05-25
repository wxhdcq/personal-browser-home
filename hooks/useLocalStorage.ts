"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, Dispatch<SetStateAction<T>>, boolean] {
  const [initialJson] = useState(() => JSON.stringify(initialValue));

  const getSnapshot = useCallback(
    () => localStorageAdapter.getItemSync(key) ?? initialJson,
    [initialJson, key],
  );

  const subscribe = useCallback(
    (callback: () => void) => localStorageAdapter.subscribe(key, callback),
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
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (current: T) => T)(value)
          : nextValue;

      void localStorageAdapter.setItem(key, JSON.stringify(resolvedValue));
    },
    [key, value],
  );

  return [value, setValue, true] as const;
}
