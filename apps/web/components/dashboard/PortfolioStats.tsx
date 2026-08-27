"use client";

import { formatCurrency, formatSignedCurrency } from "../../lib/utils/format";
import type { PortfolioSummary } from "../../lib/graphql/portfolio";
import { Card } from "../ui/Card";

const ALLOCATION_COLORS = ["#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ef4444", "#06b6d4"];

interface PortfolioStatsProps {
  portfolio: PortfolioSummary | null;
  isAuthenticated: boolean;
  authReady?: boolean;
}

function MetricSkeleton({ label }: { label: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="metric-value mt-1 text-2xl font-semibold tracking-tight text-slate-500 sm:text-3xl lg:text-4xl">
        —
      </p>
    </div>
  );
}

export function PortfolioStats({
  portfolio,
  isAuthenticated,
  authReady = true,
}: PortfolioStatsProps) {
  if (!authReady) {
    return (
      <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        <MetricSkeleton label="Total portfolio value" />
        <MetricSkeleton label="Today's gain" />
        <MetricSkeleton label="Total return" />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        <div>
          <p className="text-xs text-slate-500 sm:text-sm">Total portfolio value</p>
          <p className="metric-value mt-1 text-2xl font-semibold tracking-tight text-slate-500 sm:text-3xl lg:text-4xl">
            Sign in to view
          </p>
        </div>
      </section>
    );
  }

  if (!portfolio) {
    return (
      <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        <MetricSkeleton label="Total portfolio value" />
        <MetricSkeleton label="Today's gain" />
        <MetricSkeleton label="Total return" />
      </section>
    );
  }

  const todayPositive = portfolio.todayGain >= 0;
  const returnPositive = portfolio.totalReturnPercent >= 0;

  return (
    <section className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-3 sm:gap-6 lg:gap-8">
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Total portfolio value</p>
        <p className="metric-value mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {formatCurrency(portfolio.totalValue)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Today&apos;s gain</p>
        <p
          className={`metric-value mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl ${
            todayPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {formatSignedCurrency(portfolio.todayGain)}
        </p>
      </div>
      <div>
        <p className="text-xs text-slate-500 sm:text-sm">Total return</p>
        <p
          className={`metric-value mt-1 text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl ${
            returnPositive ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {returnPositive ? "+" : ""}
          {portfolio.totalReturnPercent}%
        </p>
      </div>
    </section>
  );
}

interface AllocationSectionProps {
  portfolio: PortfolioSummary | null;
  isAuthenticated: boolean;
}

export function AllocationSectionInner({
  portfolio,
  isAuthenticated,
}: AllocationSectionProps) {
  if (!isAuthenticated || !portfolio || portfolio.holdings.length === 0) {
    return (
      <Card title="Allocation">
        <p className="text-sm text-slate-500">No holdings yet.</p>
      </Card>
    );
  }

  const total = portfolio.holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const items = portfolio.holdings.map((h, i) => ({
    symbol: h.ticker,
    percent: total > 0 ? Math.round((h.marketValue / total) * 100) : 0,
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
  }));

  return (
    <Card title="Allocation">
      <div className="flex h-2.5 overflow-hidden rounded-full sm:h-3">
        {items.map((item) => (
          <div
            key={item.symbol}
            style={{ width: `${item.percent}%`, backgroundColor: item.color }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 sm:gap-x-6 sm:text-sm">
        {items.map((item) => (
          <span key={item.symbol} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.symbol} {item.percent}%
          </span>
        ))}
      </div>
    </Card>
  );
}
