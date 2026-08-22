"use client";

import { useMemo, useState } from "react";
import {
  CHART_PERIODS,
  generateChartSeries,
  type ChartPeriod,
} from "../../lib/mock/stocks";

interface StockChartProps {
  symbol: string;
  price: number;
  isPositive: boolean;
}

function buildPath(values: number[], width: number, height: number): string {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function StockChart({ symbol, price, isPositive }: StockChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("7d");

  const series = useMemo(
    () => generateChartSeries(symbol, period, price),
    [symbol, period, price],
  );

  const linePath = useMemo(() => buildPath(series, 100, 40), [series]);
  const areaPath = `${linePath} L100,40 L0,40 Z`;
  const strokeColor = isPositive ? "#34d399" : "#f87171";

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {CHART_PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors sm:text-sm ${
              period === item.id
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-[#3a3a3a] text-slate-400 hover:border-[#555] hover:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 100 40" className="h-40 w-full sm:h-52" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`chart-fill-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#chart-fill-${symbol})`} />
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
