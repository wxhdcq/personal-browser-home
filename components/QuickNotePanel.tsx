"use client";

import { FileText, Plus } from "lucide-react";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";

export function QuickNotePanel() {
  const [note, setNote] = useLocalStorage(
    storageKeys.quickNote,
    "想法记录、临时笔记、灵感闪现...",
  );

  return (
    <SurfaceCard>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FileText aria-hidden size={18} className="text-warning" />
          快捷笔记
        </h2>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          aria-label="新建笔记"
          title="新建"
          onClick={() => setNote("")}
        >
          <Plus aria-hidden size={16} />
        </button>
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        className="mt-5 h-24 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
        placeholder="记录一个快速想法"
      />
      <p className="mt-3 text-xs text-muted-foreground">本地保存于浏览器</p>
    </SurfaceCard>
  );
}
