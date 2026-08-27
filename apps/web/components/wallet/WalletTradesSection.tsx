import type { TransactionItem } from "../../lib/graphql/wallet";
import { formatCurrency } from "../../lib/utils/format";
import { Card } from "../ui/Card";

interface WalletTradesSectionProps {
  trades: TransactionItem[];
}

export function WalletTradesSection({ trades }: WalletTradesSectionProps) {
  return (
    <Card title="Trade history">
      {trades.length === 0 ? (
        <p className="text-sm text-slate-500">No trades yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[420px]">
            <div className="grid grid-cols-5 gap-3 border-b border-[#2a2a2a] pb-3 text-xs text-slate-500 sm:gap-4 sm:text-sm">
              <span>Date</span>
              <span>Stock</span>
              <span>Side</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-[#2a2a2a]">
              {trades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-5 gap-3 py-3 sm:gap-4">
                  <span className="text-sm text-slate-300">
                    {new Date(trade.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-medium text-white">{trade.ticker}</span>
                  <span
                    className={`text-sm ${trade.side === "BUY" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {trade.side === "BUY" ? "Buy" : "Sell"}
                  </span>
                  <span className="text-right text-sm text-slate-300">{trade.quantity}</span>
                  <span className="text-right text-sm text-slate-300">
                    {formatCurrency(trade.total)}
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
