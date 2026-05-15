"use client";

import { Download, Upload } from "lucide-react";
import { FormEvent, useState } from "react";
import { defaultSettings } from "@/data/settings";
import { searchEngines } from "@/data/searchEngines";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { SearchEngineId, UserSettings } from "@/types/home";

const localStorageKeys = Object.values(storageKeys);

export function SettingsPanel() {
  const [settings, setSettings] = useLocalStorage<UserSettings>(
    storageKeys.settings,
    defaultSettings,
  );
  const [dataText, setDataText] = useState("");
  const [status, setStatus] = useState("");

  function exportData() {
    const data: Record<string, string | null> = {};

    localStorageKeys.forEach((key) => {
      data[key] = window.localStorage.getItem(key);
    });

    setDataText(JSON.stringify(data, null, 2));
    setStatus("已生成导出数据");
  }

  function importData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const parsed = JSON.parse(dataText) as Record<string, string | null>;

      localStorageKeys.forEach((key) => {
        if (!(key in parsed)) return;

        if (parsed[key] === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, String(parsed[key]));
        }

        window.dispatchEvent(
          new CustomEvent("personal-home.local-storage-change", {
            detail: { key },
          }),
        );
      });

      setStatus("导入完成，刷新页面后全部模块会读取新数据");
    } catch {
      setStatus("导入失败，JSON 格式不正确");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
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
              {searchEngines.map((engine) => (
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

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-border bg-elevated/70 p-4">
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
        </div>
      </SurfaceCard>

      <SurfaceCard padding="sm">
        <h2 className="text-base font-semibold text-foreground">
          本地数据导入/导出
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          这里会导出书签、历史、笔记、待办、模块和设置。后续改成 Chrome
          扩展时，可以切换到 chrome.storage.sync。
        </p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={exportData}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-border text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            <Download aria-hidden size={16} />
            生成导出
          </button>
        </div>
        <form onSubmit={importData} className="mt-3 space-y-3">
          <textarea
            value={dataText}
            onChange={(event) => setDataText(event.target.value)}
            className="h-72 w-full resize-none rounded-lg border border-border bg-elevated/70 p-3 font-mono text-xs leading-5 outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
            placeholder="导出的 JSON 或要导入的 JSON"
          />
          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
          >
            <Upload aria-hidden size={16} />
            导入数据
          </button>
        </form>
        {status ? (
          <p className="mt-3 text-sm text-muted-foreground">{status}</p>
        ) : null}
      </SurfaceCard>
    </div>
  );
}
