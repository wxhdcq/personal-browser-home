export const shortcutCategories = [
  "AI 工具",
  "投资",
  "学习",
  "开发",
  "娱乐",
  "服务器",
] as const;

export type ShortcutCategory = (typeof shortcutCategories)[number];

export type SearchEngineId =
  | "google"
  | "bing"
  | "youtube"
  | "github"
  | "perplexity";

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  iconUrl?: string;
  placeholder: string;
  urlTemplate: string;
}

export interface ShortcutLink {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  description: string;
  category: ShortcutCategory;
}

export interface BookmarkItem extends ShortcutLink {
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  type: "search" | "shortcut" | "bookmark" | "download";
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  metadata?: {
    engine?: SearchEngineId;
    category?: ShortcutCategory;
  };
}

export type DownloadCategory = "开发工具" | "文档资料" | "服务器" | "常用软件";

export interface DownloadResource {
  id: string;
  name: string;
  url: string;
  description: string;
  category: DownloadCategory;
  sizeLabel: string;
  updatedAt: string;
}

export interface ModulePreference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type InvestmentTrend = "up" | "down" | "flat";
type InvestmentQuoteSource = "static" | "stooq";

export interface InvestmentQuote {
  priceLabel: string;
  changeLabel: string;
  trend: InvestmentTrend;
  asOf: string;
  source: InvestmentQuoteSource;
}

export interface InvestmentAsset {
  symbol: string;
  stooqSymbol?: string;
  name: string;
  assetType: "stock" | "etf" | "commodity";
  market: "US" | "Global";
  currency: "USD" | "CNY";
  note: string;
  tags: string[];
  quote: InvestmentQuote;
}

export interface UserSettings {
  defaultSearchEngine: SearchEngineId;
  enableHistoryCapture: boolean;
  weatherLocation: string;
}

export interface WeatherSnapshot {
  locationLabel: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherText: string;
  isDay: boolean;
  airQualityIndex?: number;
  airQualityText?: string;
  pm25?: number;
  observedAt: string;
  fetchedAt: string;
  source: "Open-Meteo";
}
