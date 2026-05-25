"use client";

import { useCallback, useEffect, useState } from "react";
import {
  browserApiAdapter,
  type BrowserHistoryItem,
} from "@/core/browser/BrowserApiAdapter";

type BrowserDataStatus = "loading" | "ready" | "unavailable" | "error";

export function useBrowserHistory(maxResults = 50) {
  const [status, setStatus] = useState<BrowserDataStatus>("loading");
  const [items, setItems] = useState<BrowserHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!browserApiAdapter.getAvailability().history) {
      setItems([]);
      setStatus("unavailable");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const history = await browserApiAdapter.getRecentHistory(maxResults);
      setItems(history);
      setStatus("ready");
    } catch (caught) {
      setItems([]);
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "读取浏览器历史失败");
    }
  }, [maxResults]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { status, items, error, refresh };
}
