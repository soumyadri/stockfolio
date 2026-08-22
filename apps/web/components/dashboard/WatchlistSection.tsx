import { formatChange, formatCurrency, watchlistItems } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

interface WatchlistSectionProps {
  onTrade: (symbol: string) => void;
}

export function WatchlistSection({ onTrade }: WatchlistSectionProps) {
  return (
    <Card title="Watchlist">
      <div className="overflow-x-auto">
        <div className="min-w-[280px] space-y-1">
          <div className="grid grid-cols-[minmax(60px,1fr)_minmax(80px,1fr)_minmax(70px,1fr)_auto] gap-2 px-1 pb-2 text-xs text-slate-500 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <span>Stock</span>
            <span>Price</span>
            <span>Change</span>
            <span className="w-14 sm:w-16" />
          </div>

          {watchlistItems.map((item) => (
            <div
              key={item.symbol}
              className="grid grid-cols-[minmax(60px,1fr)_minmax(80px,1fr)_minmax(70px,1fr)_auto] items-center gap-2 rounded-lg px-1 py-2.5 hover:bg-[#1a1a1a] sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <span className="text-sm font-medium text-white">{item.symbol}</span>
              <span className="text-sm text-slate-300">{formatCurrency(item.price)}</span>
              <span
                className={`text-sm ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatChange(item.change)}
              </span>
              <button
                type="button"
                onClick={() => onTrade(item.symbol)}
                className="w-14 rounded-lg border border-[#3a3a3a] px-2 py-1 text-xs font-medium text-slate-200 hover:border-[#555] hover:bg-[#1a1a1a] sm:w-16"
              >
                Trade
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
