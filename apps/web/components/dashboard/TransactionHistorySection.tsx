import { formatCurrency, transactionItems } from "../../lib/mock/dashboard";
import { Card } from "../ui/Card";

export function TransactionHistorySection() {
  return (
    <Card title="Transaction history">
      <div className="overflow-x-auto">
        <div className="min-w-[320px] space-y-1">
          <div className="grid grid-cols-4 gap-2 px-1 pb-2 text-xs text-slate-500 sm:gap-4">
            <span>Date</span>
            <span>Stock</span>
            <span>Side</span>
            <span className="text-right">Total</span>
          </div>

          {transactionItems.map((item) => (
            <div
              key={`${item.date}-${item.symbol}-${item.side}`}
              className="grid grid-cols-4 gap-2 rounded-lg px-1 py-2.5 hover:bg-[#1a1a1a] sm:gap-4"
            >
              <span className="text-sm text-slate-300">{item.date}</span>
              <span className="text-sm font-medium text-white">{item.symbol}</span>
              <span
                className={`text-sm ${item.side === "Buy" ? "text-emerald-400" : "text-red-400"}`}
              >
                {item.side}
              </span>
              <span className="text-right text-sm text-slate-300">
                {formatCurrency(item.total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
