"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getWatchlist, saveWatchlist } from "./storage";

interface WatchlistContextValue {
  symbols: string[];
  isWatching: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [symbols, setSymbols] = useState<string[]>([]);

  useEffect(() => {
    setSymbols(getWatchlist());
  }, []);

  const persist = useCallback((next: string[]) => {
    setSymbols(next);
    saveWatchlist(next);
  }, []);

  const isWatching = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols],
  );

  const toggle = useCallback(
    (symbol: string) => {
      const upper = symbol.toUpperCase();
      const next = isWatching(upper)
        ? symbols.filter((s) => s !== upper)
        : [...symbols, upper];
      persist(next);
    },
    [symbols, isWatching, persist],
  );

  const value = useMemo(
    () => ({ symbols, isWatching, toggle }),
    [symbols, isWatching, toggle],
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return context;
}
