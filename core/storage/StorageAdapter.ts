export const storageChangeEvent = "personal-home.storage-change";

export interface StorageChangeDetail {
  key?: string;
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getItems(keys: string[]): Promise<Record<string, string | null>>;
  setItems(items: Record<string, string | null>): Promise<void>;
  subscribe(key: string | null, callback: () => void): () => void;
}

export interface SyncStorageAdapter extends StorageAdapter {
  getItemSync(key: string): string | null;
}
