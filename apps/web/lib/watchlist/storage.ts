const WATCHLIST_KEY = "stockfolio_watchlist";
const DEFAULT_SYMBOLS = ["AAPL", "TSLA"];

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_SYMBOLS;
  const stored = localStorage.getItem(WATCHLIST_KEY);
  if (!stored) return DEFAULT_SYMBOLS;
  try {
    return JSON.parse(stored) as string[];
  } catch {
    return DEFAULT_SYMBOLS;
  }
}

export function saveWatchlist(symbols: string[]): void {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
}
