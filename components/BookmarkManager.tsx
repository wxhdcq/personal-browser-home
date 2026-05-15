"use client";

import {
  ArrowDown,
  ArrowUp,
  Edit3,
  ExternalLink,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { PlatformIcon } from "@/components/ShortcutGrid";
import { SurfaceCard } from "@/components/SurfaceCard";
import { shortcuts } from "@/data/shortcuts";
import { useHistoryRecorder } from "@/hooks/useHistoryRecorder";
import {
  toManagedShortcutItems,
  useManagedShortcuts,
} from "@/hooks/useManagedShortcuts";
import {
  BookmarkItem,
  ShortcutCategory,
  shortcutCategories,
} from "@/types/home";

const allCategories = ["全部", ...shortcutCategories] as const;

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function emptyForm() {
  return {
    name: "",
    url: "",
    description: "",
    category: shortcutCategories[0],
  };
}

export function BookmarkManager() {
  const [shortcutsList, setShortcutsList] = useManagedShortcuts();
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
  }>(emptyForm);
  const recordHistory = useHistoryRecorder();

  const filteredShortcuts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return shortcutsList.filter((shortcut) => {
      const matchesCategory =
        category === "全部" || shortcut.category === category;
      const matchesKeyword =
        !keyword ||
        [shortcut.name, shortcut.url, shortcut.description]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [category, query, shortcutsList]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const now = new Date().toISOString();
    const url = normalizeUrl(form.url);
    const name = form.name.trim();

    if (!name || !url) return;

    if (editingId) {
      setShortcutsList((current) =>
        current.map((shortcut) =>
          shortcut.id === editingId
            ? {
                ...shortcut,
                name,
                url,
                description: form.description.trim(),
                category: form.category,
                updatedAt: now,
              }
            : shortcut,
        ),
      );
    } else {
      setShortcutsList((current) => [
        ...current,
        {
          id: createId(),
          name,
          url,
          description: form.description.trim(),
          category: form.category,
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    resetForm();
  }

  function startEdit(shortcut: BookmarkItem) {
    setEditingId(shortcut.id);
    setForm({
      name: shortcut.name,
      url: shortcut.url,
      description: shortcut.description,
      category: shortcut.category,
    });
  }

  function removeShortcut(id: string) {
    setShortcutsList((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  function moveShortcut(id: string, direction: -1 | 1) {
    setShortcutsList((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function restoreDefaults() {
    setShortcutsList(toManagedShortcutItems(shortcuts));
    resetForm();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <SurfaceCard padding="sm">
        <h2 className="text-base font-semibold text-foreground">
          {editingId ? "编辑快捷入口" : "新增快捷入口"}
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
              {editingId ? "保存修改" : "添加入口"}
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
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <RotateCcw aria-hidden size={16} />
            恢复默认快捷入口
          </button>
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
              placeholder="搜索快捷入口"
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
          {filteredShortcuts.map((shortcut) => {
            const index = shortcutsList.findIndex((item) => item.id === shortcut.id);

            return (
              <article
                key={shortcut.id}
                className="rounded-lg border border-border bg-elevated/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <PlatformIcon shortcut={shortcut} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {shortcut.name}
                      </h3>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {shortcut.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => moveShortcut(shortcut.id, -1)}
                      disabled={index <= 0}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="上移"
                      title="上移"
                    >
                      <ArrowUp aria-hidden size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveShortcut(shortcut.id, 1)}
                      disabled={index === shortcutsList.length - 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="下移"
                      title="下移"
                    >
                      <ArrowDown aria-hidden size={16} />
                    </button>
                    <a
                      href={shortcut.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        recordHistory({
                          type: "bookmark",
                          title: shortcut.name,
                          url: shortcut.url,
                          description: shortcut.description,
                          metadata: { category: shortcut.category },
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/15 hover:text-primary"
                      aria-label="打开快捷入口"
                      title="打开"
                    >
                      <ExternalLink aria-hidden size={16} />
                    </a>
                    <button
                      type="button"
                      onClick={() => startEdit(shortcut)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/15 hover:text-primary"
                      aria-label="编辑快捷入口"
                      title="编辑"
                    >
                      <Edit3 aria-hidden size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeShortcut(shortcut.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      aria-label="删除快捷入口"
                      title="删除"
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {shortcut.description || "暂无描述"}
                </p>
                <span className="mt-3 inline-flex rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                  {shortcut.category}
                </span>
              </article>
            );
          })}
        </div>
      </SurfaceCard>
    </div>
  );
}
