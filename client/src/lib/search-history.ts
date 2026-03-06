export interface SearchHistoryEntry {
  type: "repo" | "profile";
  value: string;
  label: string;
  timestamp: number;
}

const STORAGE_KEY = "reposcan-search-history";
const MAX_ENTRIES = 10;

export function getSearchHistory(): SearchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SearchHistoryEntry[];
  } catch {
    return [];
  }
}

export function addSearchHistory(entry: Omit<SearchHistoryEntry, "timestamp">): void {
  const history = getSearchHistory();
  const filtered = history.filter(
    (h) => !(h.type === entry.type && h.value === entry.value)
  );
  filtered.unshift({ ...entry, timestamp: Date.now() });
  const trimmed = filtered.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function clearSearchHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
