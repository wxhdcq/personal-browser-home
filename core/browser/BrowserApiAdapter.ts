export interface BrowserBookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BrowserBookmarkNode[];
}

export interface BrowserHistoryItem {
  id: string;
  title: string;
  url: string;
  lastVisitTime?: number;
}

export interface BrowserDownloadItem {
  id: string;
  filename: string;
  url: string;
  startTime?: string;
  state?: string;
}

export interface BrowserApiAvailability {
  runtime: boolean;
  bookmarks: boolean;
  history: boolean;
  downloads: boolean;
}

export interface BrowserApiAdapter {
  isAvailable(): boolean;
  getAvailability(): BrowserApiAvailability;
  getBookmarksTree(): Promise<BrowserBookmarkNode[]>;
  getRecentHistory(maxResults?: number): Promise<BrowserHistoryItem[]>;
  getRecentDownloads(maxResults?: number): Promise<BrowserDownloadItem[]>;
}

interface ChromeRuntime {
  lastError?: {
    message?: string;
  };
}

interface ChromeBookmarkTreeNode {
  id: string;
  title?: string;
  url?: string;
  children?: ChromeBookmarkTreeNode[];
}

interface ChromeHistoryItem {
  id?: string;
  title?: string;
  url?: string;
  lastVisitTime?: number;
}

interface ChromeDownloadItem {
  id?: number;
  filename?: string;
  url?: string;
  finalUrl?: string;
  startTime?: string;
  state?: string;
}

interface ChromeLike {
  runtime?: ChromeRuntime;
  bookmarks?: {
    getTree(callback: (results: ChromeBookmarkTreeNode[]) => void): void;
  };
  history?: {
    search(
      query: { text: string; maxResults: number },
      callback: (results: ChromeHistoryItem[]) => void,
    ): void;
  };
  downloads?: {
    search(
      query: { orderBy?: string[]; limit?: number },
      callback: (results: ChromeDownloadItem[]) => void,
    ): void;
  };
}

function getChrome() {
  return (globalThis as typeof globalThis & { chrome?: ChromeLike }).chrome;
}

function getChromeError() {
  const message = getChrome()?.runtime?.lastError?.message;
  return message ? new Error(message) : null;
}

function normalizeBookmark(node: ChromeBookmarkTreeNode): BrowserBookmarkNode {
  return {
    id: node.id,
    title: node.title ?? "",
    url: node.url,
    children: node.children?.map(normalizeBookmark),
  };
}

export class ChromeBrowserApiAdapter implements BrowserApiAdapter {
  isAvailable() {
    return Boolean(getChrome());
  }

  getAvailability() {
    const chrome = getChrome();

    return {
      runtime: Boolean(chrome),
      bookmarks: Boolean(chrome?.bookmarks),
      history: Boolean(chrome?.history),
      downloads: Boolean(chrome?.downloads),
    };
  }

  async getBookmarksTree() {
    const bookmarks = getChrome()?.bookmarks;
    if (!bookmarks) return [];

    return new Promise<BrowserBookmarkNode[]>((resolve, reject) => {
      bookmarks.getTree((results) => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve(results.map(normalizeBookmark));
      });
    });
  }

  async getRecentHistory(maxResults = 20) {
    const history = getChrome()?.history;
    if (!history) return [];

    return new Promise<BrowserHistoryItem[]>((resolve, reject) => {
      history.search({ text: "", maxResults }, (results) => {
        const error = getChromeError();
        if (error) {
          reject(error);
          return;
        }

        resolve(
          results
            .filter((item) => item.url)
            .map((item, index) => ({
              id: item.id ?? String(index),
              title: item.title ?? item.url ?? "",
              url: item.url ?? "",
              lastVisitTime: item.lastVisitTime,
            })),
        );
      });
    });
  }

  async getRecentDownloads(maxResults = 20) {
    const downloads = getChrome()?.downloads;
    if (!downloads) return [];

    return new Promise<BrowserDownloadItem[]>((resolve, reject) => {
      downloads.search(
        { orderBy: ["-startTime"], limit: maxResults },
        (results) => {
          const error = getChromeError();
          if (error) {
            reject(error);
            return;
          }

          resolve(
            results.map((item, index) => ({
              id: String(item.id ?? index),
              filename: item.filename ?? "",
              url: item.finalUrl ?? item.url ?? "",
              startTime: item.startTime,
              state: item.state,
            })),
          );
        },
      );
    });
  }
}

export const browserApiAdapter = new ChromeBrowserApiAdapter();
