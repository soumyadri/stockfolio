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
import { useAuth } from "../auth/context";
import {
  addToWatchlist as addToWatchlistApi,
  fetchWatchlist,
  removeFromWatchlist as removeFromWatchlistApi,
} from "../graphql/watchlist";

interface WatchlistContextValue {
  symbols: string[];
  isReady: boolean;
  isWatching: (symbol: string) => boolean;
  toggle: (symbol: string) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, authReady } = useAuth();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    const load = async () => {
      setIsReady(false);

      if (!isAuthenticated) {
        setSymbols([]);
        setIsReady(true);
        return;
      }

      try {
        const tickers = await fetchWatchlist();
        if (!cancelled) {
          setSymbols(tickers);
        }
      } catch {
        if (!cancelled) {
          setSymbols([]);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [authReady, isAuthenticated]);

  const isWatching = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols],
  );

  const toggle = useCallback(
    (symbol: string) => {
      if (!isAuthenticated) return;

      const upper = symbol.toUpperCase();
      const remove = isWatching(upper);

      const request = remove ? removeFromWatchlistApi(upper) : addToWatchlistApi(upper);

      void request
        .then(setSymbols)
        .catch(() => {
          // keep current state on failure
        });
    },
    [isAuthenticated, isWatching],
  );

  const value = useMemo(
    () => ({ symbols, isReady, isWatching, toggle }),
    [symbols, isReady, isWatching, toggle],
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
