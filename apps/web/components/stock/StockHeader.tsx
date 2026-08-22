"use client";

import { useWatchlist } from "../../lib/watchlist/context";
import type { StockDetail } from "../../lib/mock/stocks";
import { formatChange, formatCurrency } from "../../lib/mock/dashboard";

interface StockHeaderProps {
  stock: StockDetail;
}

export function StockHeader({ stock }: StockHeaderProps) {
  const { isWatching, toggle } = useWatchlist();
  const watching = isWatching(stock.symbol);
  const isPositive = stock.changePercent >= 0;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{stock.symbol}</h1>
        <p className="mt-1 text-sm text-slate-400 sm:text-base">{stock.name}</p>
        <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3">
          <span className="text-3xl font-semibold text-white sm:text-4xl">
            {formatCurrency(stock.price)}
          </span>
          <span className={`text-sm font-medium sm:text-base ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}
            {formatCurrency(Math.abs(stock.changeAmount))} ({formatChange(stock.changePercent)})
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggle(stock.symbol)}
        className={`flex shrink-0 items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
          watching
            ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
            : "border-[#3a3a3a] text-slate-300 hover:border-[#555] hover:bg-[#1a1a1a]"
        }`}
      >
        <span>{watching ? "★" : "☆"}</span>
        {watching ? "Watching" : "Watch"}
      </button>
    </div>
  );
}
