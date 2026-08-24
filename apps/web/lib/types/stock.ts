export interface Quote {
  ticker: string;
  companyName: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  sharesOwned: number;
}

export interface Stock {
  ticker: string;
  companyName: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export type ChartPeriod = "1d" | "7d" | "30d" | "6m" | "1y";

export const CHART_PERIOD_DAYS: Record<ChartPeriod, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "6m": 180,
  "1y": 365,
};

export const CHART_PERIODS: { id: ChartPeriod; label: string }[] = [
  { id: "1d", label: "1D" },
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "6m", label: "6M" },
  { id: "1y", label: "1Y" },
];

export function isPositiveChange(change: number): boolean {
  return change >= 0;
}

export const STOCK_DETAIL_POLL_MS = 5_000;
export const STOCK_CHART_POLL_1D_MS = 60_000;
