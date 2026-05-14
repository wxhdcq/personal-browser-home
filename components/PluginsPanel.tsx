"use client";

import { RotateCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { defaultModules } from "@/data/modules";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { ModulePreference } from "@/types/home";

export function PluginsPanel() {
  const [modules, setModules] = useLocalStorage<ModulePreference[]>(
    storageKeys.modulePreferences,
    defaultModules,
  );

  function toggleModule(id: string) {
    setModules((current) =>
      current.map((module) =>
        module.id === id ? { ...module, enabled: !module.enabled } : module,
      ),
    );
  }

  return (
    <SurfaceCard padding="sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">首页模块</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            第一版管理首页内部模块；改成 Chrome 扩展后可继续沿用这套设置。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModules(defaultModules)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-primary"
        >
          <RotateCcw aria-hidden size={16} />
          重置
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {modules.map((module) => (
          <article
            key={module.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-elevated/70 p-4"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {module.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleModule(module.id)}
              className={[
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition",
                module.enabled
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-label={module.enabled ? "关闭模块" : "开启模块"}
              title={module.enabled ? "关闭" : "开启"}
            >
              {module.enabled ? (
                <ToggleRight aria-hidden size={22} />
              ) : (
                <ToggleLeft aria-hidden size={22} />
              )}
            </button>
          </article>
        ))}
      </div>
    </SurfaceCard>
  );
}
