"use client";

import { Edit3, Pin, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { createId } from "@/core/utils/id";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { NoteItem } from "@/types/home";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotesManager() {
  const [notes, setNotes] = useLocalStorage<NoteItem[]>(storageKeys.notes, []);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const visibleNotes = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return [...notes]
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      .filter(
        (note) =>
          !keyword ||
          [note.title, note.content].join(" ").toLowerCase().includes(keyword),
      );
  }, [notes, query]);

  function resetForm() {
    setEditingId(null);
    setForm({ title: "", content: "" });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const content = form.content.trim();

    if (!title && !content) {
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      setNotes((current) =>
        current.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: title || "未命名笔记",
                content,
                updatedAt: now,
              }
            : note,
        ),
      );
    } else {
      setNotes((current) => [
        {
          id: createId(),
          title: title || "未命名笔记",
          content,
          pinned: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
    }

    resetForm();
  }

  function startEdit(note: NoteItem) {
    setEditingId(note.id);
    setForm({
      title: note.title,
      content: note.content,
    });
  }

  function togglePin(id: string) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note,
      ),
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <SurfaceCard padding="sm">
        <h2 className="text-base font-semibold text-foreground">
          {editingId ? "编辑笔记" : "新建笔记"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="标题"
          />
          <textarea
            value={form.content}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                content: event.target.value,
              }))
            }
            className="h-60 w-full resize-none rounded-lg border border-border bg-elevated/70 p-3 text-sm leading-6 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="写点什么..."
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              <Plus aria-hidden size={18} />
              {editingId ? "保存笔记" : "添加笔记"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="h-11 rounded-lg border border-border px-4 text-sm text-muted-foreground transition hover:text-foreground"
              >
                取消
              </button>
            ) : null}
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard padding="sm">
        <div className="relative">
          <Search
            aria-hidden
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-elevated/70 pl-9 pr-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="搜索笔记"
          />
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visibleNotes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-elevated/40 px-4 py-12 text-center text-sm text-muted-foreground lg:col-span-2">
              还没有笔记。
            </div>
          ) : (
            visibleNotes.map((note) => (
              <article
                key={note.id}
                className="rounded-lg border border-border bg-elevated/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {note.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className={[
                        "inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-primary/15",
                        note.pinned
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary",
                      ].join(" ")}
                      aria-label={note.pinned ? "取消置顶" : "置顶笔记"}
                      title={note.pinned ? "取消置顶" : "置顶"}
                    >
                      <Pin aria-hidden size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(note)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/15 hover:text-primary"
                      aria-label="编辑笔记"
                      title="编辑"
                    >
                      <Edit3 aria-hidden size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNotes((current) =>
                          current.filter((item) => item.id !== note.id),
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      aria-label="删除笔记"
                      title="删除"
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {note.content || "暂无内容"}
                </p>
              </article>
            ))
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
