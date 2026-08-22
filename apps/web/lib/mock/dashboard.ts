export interface TickerItem {
  symbol: string;
  change: number;
}

export interface AllocationItem {
  symbol: string;
  percent: number;
  color: string;
}

export interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
}

export interface TransactionItem {
  date: string;
  symbol: string;
  side: "Buy" | "Sell";
  total: number;
}

export const tickerItems: TickerItem[] = [
  { symbol: "AAPL", change: 1.2 },
  { symbol: "TSLA", change: -0.8 },
  { symbol: "INFY", change: 0.4 },
  { symbol: "RELIANCE", change: 2.1 },
  { symbol: "MSFT", change: -0.3 },
];

export const portfolioStats = {
  totalValue: 48210,
  todayGain: 612,
  totalReturn: 14.6,
};

export const allocationItems: AllocationItem[] = [
  { symbol: "AAPL", percent: 40, color: "#3b82f6" },
  { symbol: "INFY", percent: 25, color: "#22c55e" },
  { symbol: "RELIANCE", percent: 20, color: "#eab308" },
  { symbol: "Other", percent: 15, color: "#525252" },
];

export const watchlistItems: WatchlistItem[] = [
  { symbol: "AAPL", price: 228.4, change: 1.2 },
  { symbol: "TSLA", price: 241.1, change: -0.8 },
];

export const orderStocks = ["AAPL", "TSLA", "INFY", "RELIANCE", "MSFT"];

export const transactionItems: TransactionItem[] = [
  { date: "Aug 18", symbol: "AAPL", side: "Buy", total: 2284 },
  { date: "Aug 15", symbol: "INFY", side: "Sell", total: 890 },
];

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change}%`;
}
