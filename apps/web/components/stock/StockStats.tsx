import type { Quote } from "../../lib/types/stock";
import { formatCurrency } from "../../lib/mock/dashboard";

interface StockStatsProps {
  quote: Quote;
}

export function StockStats({ quote }: StockStatsProps) {
  const stats = [
    { label: "Live price", value: formatCurrency(quote.price) },
    { label: "Open", value: formatCurrency(quote.open) },
    {
      label: "Day range",
      value: `${formatCurrency(quote.dayLow)}–${formatCurrency(quote.dayHigh)}`,
    },
    { label: "You own", value: `${quote.sharesOwned} shares` },
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
