"use client";

import { Edit3, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { shortcuts } from "@/data/shortcuts";
import { storageKeys } from "@/data/storageKeys";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  BookmarkItem,
  ShortcutCategory,
  shortcutCategories,
} from "@/types/home";

const allCategories = ["全部", ...shortcutCategories] as const;

const initialBookmarks: BookmarkItem[] = shortcuts.map((shortcut) => ({
  ...shortcut,
  createdAt: "2026-05-14T00:00:00.000Z",
  updatedAt: "2026-05-14T00:00:00.000Z",
}));

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function BookmarkManager() {
  const [bookmarks, setBookmarks] = useLocalStorage<BookmarkItem[]>(
    storageKeys.bookmarks,
    initialBookmarks,
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof allCategories)[number]>(
    "全部",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    url: string;
    description: string;
    category: ShortcutCategory;
  }>({
    name: "",
    url: "",
    description: "",
    category: shortcutCategories[0],
  });
  const recordHistory = useHistoryRecorder();

  const filteredBookmarks = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return bookmarks.filter((bookmark) => {
      const matchesCategory =
        category === "全部" || bookmark.category === category;
      const matchesKeyword =
        !keyword ||
        [bookmark.name, bookmark.url, bookmark.description]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [bookmarks, category, query]);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      url: "",
      description: "",
      category: shortcutCategories[0],
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const url = form.url.trim();

    if (!form.name.trim() || !url) {
      return;
    }

    if (editingId) {
      setBookmarks((current) =>
        current.map((bookmark) =>
          bookmark.id === editingId
            ? {
                ...bookmark,
                name: form.name.trim(),
                url,
                description: form.description.trim(),
                category: form.category,
                updatedAt: now,
              }
            : bookmark,
        ),
      );
    } else {
      setBookmarks((current) => [
        {
          id: createId(),
          name: form.name.trim(),
          url,
          description: form.description.trim(),
          category: form.category,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
    }

    resetForm();
  }

  function startEdit(bookmark: BookmarkItem) {
    setEditingId(bookmark.id);
    setForm({
      name: bookmark.name,
      url: bookmark.url,
      description: bookmark.description,
      category: bookmark.category,
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <SurfaceCard padding="sm">
        <h2 className="text-base font-semibold text-foreground">
          {editingId ? "编辑书签" : "新增书签"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="名称"
          />
          <input
            value={form.url}
            onChange={(event) =>
              setForm((current) => ({ ...current, url: event.target.value }))
            }
            className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="https://example.com"
          />
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="h-24 w-full resize-none rounded-lg border border-border bg-elevated/70 p-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="描述"
          />
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as ShortcutCategory,
              }))
            }
            className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
          >
            {shortcutCategories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              <Plus aria-hidden size={18} />
              {editingId ? "保存修改" : "添加书签"}
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search
              aria-hidden
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-elevated/70 pl-9 pr-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="搜索书签"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={[
                  "shrink-0 rounded-lg border px-3 py-2 text-sm transition",
                  category === item
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filteredBookmarks.map((bookmark) => (
            <article
              key={bookmark.id}
              className="rounded-lg border border-border bg-elevated/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">
                    {bookmark.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {bookmark.url}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      recordHistory({
                        type: "bookmark",
                        title: bookmark.name,
                        url: bookmark.url,
                        description: bookmark.description,
                        metadata: { category: bookmark.category },
                      })
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/15 hover:text-primary"
                    aria-label="打开书签"
                    title="打开"
                  >
                    <ExternalLink aria-hidden size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => startEdit(bookmark)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/15 hover:text-primary"
                    aria-label="编辑书签"
                    title="编辑"
                  >
                    <Edit3 aria-hidden size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setBookmarks((current) =>
                        current.filter((item) => item.id !== bookmark.id),
                      )
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                    aria-label="删除书签"
                    title="删除"
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {bookmark.description || "暂无描述"}
              </p>
              <span className="mt-3 inline-flex rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                {bookmark.category}
              </span>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
