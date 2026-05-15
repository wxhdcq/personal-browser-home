import type { ModulePreference } from "@/types/home";

export const defaultModules: ModulePreference[] = [
  {
    id: "todos",
    name: "今日待办",
    description: "首页任务清单，数据保存到 localStorage。",
    enabled: true,
  },
  {
    id: "investments",
    name: "投资关注",
    description: "行情观察列表，后续可继续接入更完整的真实行情 API。",
    enabled: true,
  },
  {
    id: "quick-note",
    name: "快捷笔记",
    description: "首页快速记录想法，与笔记页共享本地存储。",
    enabled: true,
  },
  {
    id: "weather",
    name: "天气卡片",
    description: "通过 Open-Meteo 免费接口获取实时天气，位置可在设置页修改。",
    enabled: true,
  },
  {
    id: "focus",
    name: "专注模式",
    description: "25 分钟专注入口。",
    enabled: true,
  },
];
