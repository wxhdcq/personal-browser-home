"use client";

import { Download, RotateCcw, Save, Upload } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { localStorageAdapter } from "@/core/storage/LocalStorageAdapter";
import {
  createAppDataBackup,
  migrateAppDataBackup,
} from "@/core/storage/schema";
import { defaultSettings } from "@/data/settings";
import { searchEngines } from "@/data/searchEngines";
import { shortcuts } from "@/data/shortcuts";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useManagedSearchEngines } from "@/hooks/useManagedSearchEngines";
import {
  toManagedShortcutItems,
  useManagedShortcuts,
} from "@/hooks/useManagedShortcuts";
import { useModulePreferences } from "@/hooks/useModulePreferences";
import { SurfaceCard } from "@/components/SurfaceCard";
import {
  BookmarkItem,
  SearchEngine,
  SearchEngineId,
  ShortcutCategory,
  shortcutCategories,
  UserSettings,
} from "@/types/home";

const managedKeys = Object.values(storageKeys);

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

function shortcutFormFrom(item?: BookmarkItem) {
  return {
    id: item?.id ?? "",
    name: item?.name ?? "",
    url: item?.url ?? "",
    description: item?.description ?? "",
    category: item?.category ?? shortcutCategories[0],
  };
}

function engineFormFrom(engine: SearchEngine) {
  return {
    id: engine.id,
    name: engine.name,
    iconUrl: engine.iconUrl ?? "",
    placeholder: engine.placeholder,
    urlTemplate: engine.urlTemplate,
  };
}

export function SettingsPanel() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    storageKeys.settings,
    defaultSettings,
  );
  const { modules, setModules } = useModulePreferences();
  const [managedShortcuts, setManagedShortcuts] = useManagedShortcuts();
  const [managedEngines, setManagedEngines] = useManagedSearchEngines();
  const [selectedShortcutId, setSelectedShortcutId] = useState(
    managedShortcuts[0]?.id ?? "",
  );
  const [selectedEngineId, setSelectedEngineId] = useState<SearchEngineId>(
    managedEngines[0]?.id ?? "google",
  );
  const [shortcutForm, setShortcutForm] = useState(() =>
    shortcutFormFrom(managedShortcuts[0]),
  );
  const [engineForm, setEngineForm] = useState(() =>
    engineFormFrom(managedEngines[0] ?? searchEngines[0]),
  );
  const [dataText, setDataText] = useState("");
  const [status, setStatus] = useState("");

  const selectedShortcut = useMemo(
    () => managedShortcuts.find((shortcut) => shortcut.id === selectedShortcutId),
    [managedShortcuts, selectedShortcutId],
  );
  const selectedEngine = useMemo(
    () => managedEngines.find((engine) => engine.id === selectedEngineId),
    [managedEngines, selectedEngineId],
  );

  function selectShortcut(id: string) {
    const shortcut = managedShortcuts.find((item) => item.id === id);
    setSelectedShortcutId(id);
    setShortcutForm(shortcutFormFrom(shortcut));
  }

  function selectEngine(id: SearchEngineId) {
    const engine =
      managedEngines.find((item) => item.id === id) ??
      searchEngines.find((item) => item.id === id) ??
      searchEngines[0];
    setSelectedEngineId(id);
    setEngineForm(engineFormFrom(engine));
  }

  function saveShortcut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = shortcutForm.name.trim();
    const url = normalizeUrl(shortcutForm.url);
    if (!name || !url) return;

    const now = new Date().toISOString();
    const nextShortcut: BookmarkItem = {
      id: selectedShortcut?.id ?? createId(),
      name,
      url,
      description: shortcutForm.description.trim(),
      category: shortcutForm.category,
      createdAt: selectedShortcut?.createdAt ?? now,
      updatedAt: now,
    };

    setManagedShortcuts((current) => {
      if (selectedShortcut) {
        return current.map((item) =>
          item.id === selectedShortcut.id ? nextShortcut : item,
        );
      }

      return [...current, nextShortcut];
    });
    setSelectedShortcutId(nextShortcut.id);
    setShortcutForm(shortcutFormFrom(nextShortcut));
    setStatus("快捷入口已保存");
  }

  function deleteShortcut() {
    if (!selectedShortcut) return;

    setManagedShortcuts((current) =>
      current.filter((item) => item.id !== selectedShortcut.id),
    );
    setSelectedShortcutId("");
    setShortcutForm(shortcutFormFrom());
    setStatus("快捷入口已删除");
  }

  function saveEngine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = engineForm.name.trim();
    const urlTemplate = engineForm.urlTemplate.trim();

    if (!name || !urlTemplate.includes("{query}")) {
      setStatus("搜索 URL 必须包含 {query}");
      return;
    }

    const nextEngine: SearchEngine = {
      id: engineForm.id,
      name,
      iconUrl: engineForm.iconUrl.trim() || undefined,
      placeholder: engineForm.placeholder.trim() || name,
      urlTemplate,
    };

    setManagedEngines((current) =>
      current.map((engine) =>
        engine.id === nextEngine.id ? nextEngine : engine,
      ),
    );
    setEngineForm(engineFormFrom(nextEngine));
    setStatus("搜索引擎已保存");
  }

  async function exportData() {
    const records = await localStorageAdapter.getItems(managedKeys);
    const backup = createAppDataBackup(records);
    setDataText(JSON.stringify(backup, null, 2));
    setStatus(`已生成 schemaVersion ${backup.schemaVersion} 备份`);
  }

  async function importData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const parsed = JSON.parse(dataText) as unknown;
      const backup = migrateAppDataBackup(parsed);
      await localStorageAdapter.setItems(backup.records);
      setStatus(`导入完成，已迁移到 schemaVersion ${backup.schemaVersion}`);
    } catch {
      setStatus("导入失败，JSON 格式不正确");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid gap-4">
        <SurfaceCard padding="sm">
          <h2 className="text-base font-semibold text-foreground">偏好设置</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                默认搜索引擎
              </span>
              <select
                value={settings.defaultSearchEngine}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    defaultSearchEngine: event.target.value as SearchEngineId,
                  }))
                }
                className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              >
                {managedEngines.map((engine) => (
                  <option key={engine.id} value={engine.id}>
                    {engine.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                天气位置
              </span>
              <input
                value={settings.weatherLocation}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    weatherLocation: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <label className="mt-5 flex items-center justify-between rounded-lg border border-border bg-elevated/70 p-4">
            <span>
              <span className="block text-sm font-medium text-foreground">
                记录首页操作历史
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                搜索、快捷入口、书签和下载点击会进入历史页。
              </span>
            </span>
            <input
              type="checkbox"
              checked={settings.enableHistoryCapture}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  enableHistoryCapture: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-primary"
            />
          </label>
        </SurfaceCard>

        <SurfaceCard padding="sm">
          <h2 className="text-base font-semibold text-foreground">模块开关</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {modules.map((module) => (
              <label
                key={module.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-elevated/70 p-4"
              >
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {module.name}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {module.description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={module.enabled}
                  onChange={(event) =>
                    setModules((current) =>
                      current.map((item) =>
                        item.id === module.id
                          ? { ...item, enabled: event.target.checked }
                          : item,
                      ),
                    )
                  }
                  className="h-5 w-5 shrink-0 accent-primary"
                />
              </label>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard padding="sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">
              快捷入口编辑
            </h2>
            <button
              type="button"
              onClick={() => {
                setManagedShortcuts(toManagedShortcutItems(shortcuts));
                setStatus("快捷入口已恢复默认");
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <RotateCcw aria-hidden size={15} />
              恢复默认
            </button>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-elevated/50 p-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedShortcutId("");
                  setShortcutForm(shortcutFormFrom());
                }}
                className="mb-2 h-9 w-full rounded-lg border border-dashed border-border text-sm text-primary"
              >
                新增快捷入口
              </button>
              {managedShortcuts.map((shortcut) => (
                <button
                  key={shortcut.id}
                  type="button"
                  onClick={() => selectShortcut(shortcut.id)}
                  className={[
                    "mb-1 flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition",
                    shortcut.id === selectedShortcutId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-background hover:text-foreground",
                  ].join(" ")}
                >
                  <span className="truncate">{shortcut.name}</span>
                  <span className="text-xs">{shortcut.category}</span>
                </button>
              ))}
            </div>
            <form onSubmit={saveShortcut} className="grid gap-3 md:grid-cols-2">
              <input
                value={shortcutForm.name}
                onChange={(event) =>
                  setShortcutForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                placeholder="名称"
              />
              <input
                value={shortcutForm.url}
                onChange={(event) =>
                  setShortcutForm((current) => ({
                    ...current,
                    url: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                placeholder="https://example.com"
              />
              <input
                value={shortcutForm.description}
                onChange={(event) =>
                  setShortcutForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="h-11 rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                placeholder="描述"
              />
              <select
                value={shortcutForm.category}
                onChange={(event) =>
                  setShortcutForm((current) => ({
                    ...current,
                    category: event.target.value as ShortcutCategory,
                  }))
                }
                className="h-11 rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              >
                {shortcutCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
                >
                  <Save aria-hidden size={16} />
                  保存快捷入口
                </button>
                {selectedShortcut ? (
                  <button
                    type="button"
                    onClick={deleteShortcut}
                    className="h-10 rounded-lg border border-border px-4 text-sm text-danger transition hover:border-danger/40"
                  >
                    删除
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-4 content-start">
        <SurfaceCard padding="sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">
              搜索引擎编辑
            </h2>
            <button
              type="button"
              onClick={() => {
                setManagedEngines(searchEngines);
                setEngineForm(engineFormFrom(searchEngines[0]));
                setSelectedEngineId(searchEngines[0].id);
                setStatus("搜索引擎已恢复默认");
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-primary"
            >
              <RotateCcw aria-hidden size={15} />
              重置
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {managedEngines.map((engine) => (
              <button
                key={engine.id}
                type="button"
                onClick={() => selectEngine(engine.id)}
                className={[
                  "rounded-lg border px-3 py-2 text-sm transition",
                  engine.id === selectedEngineId
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {engine.name}
              </button>
            ))}
          </div>
          <form onSubmit={saveEngine} className="mt-4 space-y-3">
            <input
              value={engineForm.name}
              onChange={(event) =>
                setEngineForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="名称"
            />
            <input
              value={engineForm.placeholder}
              onChange={(event) =>
                setEngineForm((current) => ({
                  ...current,
                  placeholder: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="搜索框占位文案"
            />
            <input
              value={engineForm.iconUrl}
              onChange={(event) =>
                setEngineForm((current) => ({
                  ...current,
                  iconUrl: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-elevated/70 px-3 text-sm outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="图标 URL"
            />
            <input
              value={engineForm.urlTemplate}
              onChange={(event) =>
                setEngineForm((current) => ({
                  ...current,
                  urlTemplate: event.target.value,
                }))
              }
              className="h-10 w-full rounded-lg border border-border bg-elevated/70 px-3 font-mono text-xs outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="https://example.com/search?q={query}"
            />
            <button
              type="submit"
              disabled={!selectedEngine}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save aria-hidden size={16} />
              保存搜索引擎
            </button>
          </form>
        </SurfaceCard>

        <SurfaceCard padding="sm">
          <h2 className="text-base font-semibold text-foreground">
            完整数据备份 / 恢复
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            导出内容包含 schemaVersion、快捷入口、搜索引擎、设置、模块开关、待办、笔记和历史数据。
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void exportData()}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary"
            >
              <Download aria-hidden size={16} />
              生成备份
            </button>
          </div>
          <form onSubmit={(event) => void importData(event)} className="mt-3 space-y-3">
            <textarea
              value={dataText}
              onChange={(event) => setDataText(event.target.value)}
              className="h-72 w-full resize-none rounded-lg border border-border bg-elevated/70 p-3 font-mono text-xs leading-5 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
              placeholder="导出的 JSON 或要恢复的 JSON"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              <Upload aria-hidden size={16} />
              恢复数据
            </button>
          </form>
          {status ? (
            <p className="mt-3 text-sm text-muted-foreground">{status}</p>
          ) : null}
        </SurfaceCard>
      </div>
    </div>
  );
}
