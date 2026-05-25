"use client";

import { searchEngines } from "@/data/searchEngines";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { SearchEngine } from "@/types/home";

export function useManagedSearchEngines() {
  return useLocalStorage<SearchEngine[]>(storageKeys.searchEngines, searchEngines);
}
