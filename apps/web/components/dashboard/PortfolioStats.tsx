import { formatCurrency, portfolioStats } from "../../lib/mock/dashboard";

export function PortfolioStats() {
  return (
    <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3 sm:gap-6 lg:gap-8">
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Total portfolio value</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {formatCurrency(portfolioStats.totalValue)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Today&apos;s gain</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-400 sm:text-3xl lg:text-4xl">
          +{formatCurrency(portfolioStats.todayGain)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Total return</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-400 sm:text-3xl lg:text-4xl">
          +{portfolioStats.totalReturn}%
        </p>
      </div>
    </section>
  );
}
