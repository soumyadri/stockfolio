"use client";

import Link from "next/link";
import { useCallback, useMemo } from "react";
import { fetchQuotes } from "../../lib/graphql/quotes";
import { formatChange, formatCurrency } from "../../lib/mock/dashboard";
import { QUOTE_POLL_INTERVAL_MS, usePolling } from "../../lib/hooks/usePolling";
import type { Quote } from "../../lib/types/stock";
import { useWatchlist } from "../../lib/watchlist/context";
import { Card } from "../ui/Card";

export function WatchlistSection() {
  const { symbols } = useWatchlist();

  const fetcher = useCallback(async (): Promise<Quote[]> => {
    if (symbols.length === 0) return [];
    return fetchQuotes(symbols);
  }, [symbols]);

  const { data: quotes } = usePolling(fetcher, QUOTE_POLL_INTERVAL_MS, symbols.length > 0);
  const quoteMap = useMemo(
    () => new Map((quotes ?? []).map((q) => [q.ticker, q])),
    [quotes],
  );

  return (
    <Card title="Watchlist">
      {symbols.length === 0 ? (
        <p className="text-sm text-slate-500">No stocks in your watchlist yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[280px] space-y-1">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 pb-2 text-xs text-slate-500">
              <span>Stock</span>
              <span>Price</span>
              <span>Change</span>
              <span className="w-14 sm:w-16" />
            </div>

            {symbols.map((symbol) => {
              const quote = quoteMap.get(symbol);
              if (!quote) {
                return (
                  <div key={symbol} className="px-1 py-2.5 text-sm text-slate-500">
                    Loading {symbol}…
                  </div>
                );
              }

              return (
                <div
                  key={symbol}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 rounded-lg px-1 py-2.5 hover:bg-[#1a1a1a]"
                >
                  <Link
                    href={`/stock/${symbol}`}
                    className="text-sm font-medium text-white hover:text-blue-400"
                  >
                    {symbol}
                  </Link>
                  <span className="text-sm text-slate-300">{formatCurrency(quote.price)}</span>
                  <span
                    className={`text-sm ${quote.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {formatChange(quote.changePercent)}
                  </span>
                  <Link
                    href={`/stock/${symbol}`}
                    className="w-14 rounded-lg border border-[#3a3a3a] px-2 py-1 text-center text-xs font-medium text-slate-200 hover:border-[#555] hover:bg-[#1a1a1a] sm:w-16"
                  >
                    Trade
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
