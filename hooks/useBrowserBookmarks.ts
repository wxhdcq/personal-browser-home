"use client";

import { useCallback, useEffect, useState } from "react";
import {
  browserApiAdapter,
  type BrowserBookmarkNode,
} from "@/core/browser/BrowserApiAdapter";
import type { BrowserDataStatus } from "@/core/browser/types";

export interface BrowserBookmarkLink {
  id: string;
  title: string;
  url: string;
  path: string;
}

function flattenBookmarks(
  nodes: BrowserBookmarkNode[],
  parentPath: string[] = [],
): BrowserBookmarkLink[] {
  return nodes.flatMap((node) => {
    const title = node.title.trim();
    const nextPath = title ? [...parentPath, title] : parentPath;
    const children = node.children
      ? flattenBookmarks(node.children, nextPath)
      : [];

    if (!node.url) return children;

    return [
      {
        id: node.id,
        title: title || node.url,
        url: node.url,
        path: parentPath.join(" / ") || "Chrome",
      },
      ...children,
    ];
  });
}

export function useBrowserBookmarks(maxResults = 80) {
  const [status, setStatus] = useState<BrowserDataStatus>("loading");
  const [items, setItems] = useState<BrowserBookmarkLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!browserApiAdapter.getAvailability().bookmarks) {
      setItems([]);
      setStatus("unavailable");
      setError(null);
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const tree = await browserApiAdapter.getBookmarksTree();
      setItems(flattenBookmarks(tree).slice(0, maxResults));
      setStatus("ready");
    } catch (caught) {
      setItems([]);
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "读取书签失败");
    }
  }, [maxResults]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  return { status, items, error, refresh };
}
