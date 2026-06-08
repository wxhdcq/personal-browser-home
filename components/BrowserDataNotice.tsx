"use client";

import { RefreshCcw } from "lucide-react";
import type { BrowserDataStatus } from "@/core/browser/types";

interface BrowserDataNoticeProps {
  status: BrowserDataStatus;
  unavailableText: string;
  emptyText: string;
  error?: string | null;
  isEmpty?: boolean;
  onRefresh: () => void;
}

export function BrowserDataNotice({
  status,
  unavailableText,
  emptyText,
  error,
  isEmpty = false,
  onRefresh,
}: BrowserDataNoticeProps) {
  if (status === "ready" && !isEmpty) return null;

  const message =
    status === "loading"
      ? "正在读取浏览器数据..."
      : status === "unavailable"
        ? unavailableText
        : status === "error"
          ? error ?? "读取浏览器数据失败"
          : emptyText;

  return (
    <div className="rounded-lg border border-dashed border-border bg-elevated/40 px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {status !== "loading" ? (
        <button
          type="button"
          onClick={onRefresh}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <RefreshCcw aria-hidden size={15} />
          重新读取
        </button>
      ) : null}
    </div>
  );
}
