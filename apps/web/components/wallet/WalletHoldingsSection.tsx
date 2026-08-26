"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { HoldingItem } from "../../lib/graphql/wallet";
import { fetchQuotes } from "../../lib/graphql/quotes";
import {
  QUOTE_POLL_DEFER_MS,
  QUOTE_POLL_INTERVAL_MS,
  usePolling,
} from "../../lib/hooks/usePolling";
import { formatCurrency } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

interface WalletHoldingsSectionProps {
  holdings: HoldingItem[];
  onHoldingsValueChange?: (value: number) => void;
}

export function WalletHoldingsSection({
  holdings,
  onHoldingsValueChange,
}: WalletHoldingsSectionProps) {
  const tickers = useMemo(() => holdings.map((h) => h.ticker), [holdings]);

  const fetcher = useCallback(async () => {
    if (tickers.length === 0) return [];
    return fetchQuotes(tickers);
  }, [tickers]);

  const { data: quotes } = usePolling(
    fetcher,
    QUOTE_POLL_INTERVAL_MS,
    tickers.length > 0,
    QUOTE_POLL_DEFER_MS,
  );

  const priceMap = useMemo(
    () => new Map((quotes ?? []).map((q) => [q.ticker, q.price])),
    [quotes],
  );

  const rows = useMemo(
    () =>
      holdings.map((holding) => {
        const currentPrice = priceMap.get(holding.ticker) ?? holding.currentPrice;
        const marketValue = +(holding.quantity * currentPrice).toFixed(2);
        return { ...holding, currentPrice, marketValue };
      }),
    [holdings, priceMap],
  );

  const holdingsTotal = useMemo(
    () => +rows.reduce((sum, row) => sum + row.marketValue, 0).toFixed(2),
    [rows],
  );

  useEffect(() => {
    onHoldingsValueChange?.(holdingsTotal);
  }, [holdingsTotal, onHoldingsValueChange]);

  return (
    <Card title="Holdings">
      {holdings.length === 0 ? (
        <p className="text-sm text-slate-500">No holdings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="grid grid-cols-5 gap-3 border-b border-[#2a2a2a] pb-3 text-xs text-slate-500 sm:gap-4 sm:text-sm">
              <span>Stock</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Avg cost</span>
              <span className="text-right">Price</span>
              <span className="text-right">Value</span>
            </div>

            <div className="divide-y divide-[#2a2a2a]">
              {rows.map((holding) => (
                <div key={holding.ticker} className="grid grid-cols-5 gap-3 py-3 sm:gap-4">
                  <span className="text-sm font-medium text-white">{holding.ticker}</span>
                  <span className="text-right text-sm text-slate-300">{holding.quantity}</span>
                  <span className="text-right text-sm text-slate-300">
                    {formatCurrency(holding.avgCost)}
                  </span>
                  <span className="text-right text-sm text-slate-300">
                    {formatCurrency(holding.currentPrice)}
                  </span>
                  <span className="text-right text-sm font-medium text-white">
                    {formatCurrency(holding.marketValue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
