export type ChartPeriod = "1d" | "7d" | "30d" | "6m" | "1y";

export interface StockDetail {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  marketCap: string;
  sharesOwned: number;
}

export const CHART_PERIODS: { id: ChartPeriod; label: string; points: number; volatility: number }[] = [
  { id: "1d", label: "1D", points: 24, volatility: 0.004 },
  { id: "7d", label: "7D", points: 7, volatility: 0.012 },
  { id: "30d", label: "30D", points: 30, volatility: 0.018 },
  { id: "6m", label: "6M", points: 26, volatility: 0.025 },
  { id: "1y", label: "1Y", points: 12, volatility: 0.035 },
];

export const stockCatalog: Record<string, StockDetail> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 228.4,
    changePercent: 1.2,
    changeAmount: 2.71,
    open: 226.1,
    dayLow: 225.8,
    dayHigh: 229.9,
    marketCap: "3.48T",
    sharesOwned: 40,
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 241.1,
    changePercent: -0.8,
    changeAmount: -1.94,
    open: 243.5,
    dayLow: 239.2,
    dayHigh: 244.8,
    marketCap: "768B",
    sharesOwned: 12,
  },
  INFY: {
    symbol: "INFY",
    name: "Infosys Ltd.",
    price: 18.42,
    changePercent: 0.4,
    changeAmount: 0.07,
    open: 18.3,
    dayLow: 18.25,
    dayHigh: 18.55,
    marketCap: "76B",
    sharesOwned: 100,
  },
  RELIANCE: {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    price: 32.15,
    changePercent: 2.1,
    changeAmount: 0.66,
    open: 31.6,
    dayLow: 31.5,
    dayHigh: 32.3,
    marketCap: "220B",
    sharesOwned: 0,
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 415.2,
    changePercent: -0.3,
    changeAmount: -1.25,
    open: 417.0,
    dayLow: 414.1,
    dayHigh: 418.5,
    marketCap: "3.1T",
    sharesOwned: 15,
  },
};

export function getStock(symbol: string): StockDetail | undefined {
  return stockCatalog[symbol.toUpperCase()];
}

export function getAllStockSymbols(): string[] {
  return Object.keys(stockCatalog);
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    return (hash >>> 0) / 4294967296;
  };
}

export function generateChartSeries(symbol: string, period: ChartPeriod, endPrice: number): number[] {
  const config = CHART_PERIODS.find((p) => p.id === period)!;
  const rand = seededRandom(`${symbol}-${period}`);
  const series = new Array<number>(config.points);
  series[config.points - 1] = endPrice;

  let price = endPrice;
  for (let i = config.points - 2; i >= 0; i--) {
    price *= 1 + (rand() - 0.48) * config.volatility;
    series[i] = price;
  }

  return series;
}

export function isPositiveChange(change: number): boolean {
  return change >= 0;
}
