import type { StockDetail } from "../../lib/mock/stocks";
import { formatCurrency } from "../../lib/mock/dashboard";

interface StockStatsProps {
  stock: StockDetail;
}

export function StockStats({ stock }: StockStatsProps) {
  const stats = [
    { label: "Open", value: formatCurrency(stock.open) },
    { label: "Day range", value: `${formatCurrency(stock.dayLow)}–${formatCurrency(stock.dayHigh)}` },
    { label: "Market cap", value: stock.marketCap },
    { label: "You own", value: `${stock.sharesOwned} shares` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-xs text-slate-500 sm:text-sm">{stat.label}</p>
          <p className="mt-1 text-sm font-medium text-white sm:text-base">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
