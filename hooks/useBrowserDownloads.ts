"use client";

import { useCallback, useEffect, useState } from "react";
import {
  browserApiAdapter,
  type BrowserDownloadItem,
} from "@/core/browser/BrowserApiAdapter";
import type { BrowserDataStatus } from "@/core/browser/types";

export function useBrowserDownloads(maxResults = 30) {
  const [status, setStatus] = useState<BrowserDataStatus>("loading");
  const [items, setItems] = useState<BrowserDownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!browserApiAdapter.getAvailability().downloads) {
      setItems([]);
      setStatus("unavailable");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const downloads = await browserApiAdapter.getRecentDownloads(maxResults);
      setItems(downloads);
      setStatus("ready");
    } catch (caught) {
      setItems([]);
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "读取下载记录失败");
    }
  }, [maxResults]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { status, items, error, refresh };
}
