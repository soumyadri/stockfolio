import type { Stock } from "@prisma/client";
import { badUserInput } from "../graphql/errors.js";
import { prisma } from "../lib/prisma.js";

let stockConfigCache: Map<string, Stock> | null = null;

export async function initStockConfigCache(): Promise<void> {
  const stocks = await prisma.stock.findMany();
  stockConfigCache = new Map(stocks.map((s) => [s.ticker, s]));
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getPriceAt(basePrice: number, tickerSeed: number, timestampMs: number): number {
  const t = timestampMs / 1000;
  const drift = Math.sin(t / 3600 + tickerSeed) * 0.02;
  const wiggle = Math.sin(t / 15 + tickerSeed * 2) * 0.005;
  const bucket = Math.floor(t / 5);
  const noise = (seededRandom(bucket + tickerSeed) - 0.5) * 0.006;
  return +(basePrice * (1 + drift + wiggle + noise)).toFixed(2);
}

async function getStockConfig(ticker: string): Promise<Stock> {
  const normalized = ticker.toUpperCase();
  if (!stockConfigCache) {
    await initStockConfigCache();
  }
  const stock = stockConfigCache!.get(normalized);
  if (!stock) {
    throw badUserInput(`Unknown ticker: ${normalized}`);
  }
  return stock;
}

export async function getCurrentPrice(ticker: string): Promise<number> {
  const stock = await getStockConfig(ticker);
  return getPriceAt(Number(stock.basePrice), stock.tickerSeed, Date.now());
}

export async function getPriceAtTime(ticker: string, timestampMs: number): Promise<number> {
  const stock = await getStockConfig(ticker);
  return getPriceAt(Number(stock.basePrice), stock.tickerSeed, timestampMs);
}

export async function getPriceHistory(
  ticker: string,
  days: number,
): Promise<{ date: string; price: number }[]> {
  const stock = await getStockConfig(ticker);
  const basePrice = Number(stock.basePrice);
  const points: { date: string; price: number }[] = [];
  const now = Date.now();
  const stepMs = (days * 24 * 60 * 60 * 1000) / 60;

  for (let i = 60; i >= 0; i--) {
    const ts = now - i * stepMs;
    points.push({
      date: new Date(ts).toISOString(),
      price: getPriceAt(basePrice, stock.tickerSeed, ts),
    });
  }
  return points;
}

export async function getDayStats(ticker: string): Promise<{ open: number; dayLow: number; dayHigh: number }> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const open = await getPriceAtTime(ticker, startOfDay.getTime());

  let dayLow = open;
  let dayHigh = open;
  const now = Date.now();
  const stepMs = 5 * 60 * 1000;

  for (let ts = startOfDay.getTime(); ts <= now; ts += stepMs) {
    const price = await getPriceAtTime(ticker, ts);
    dayLow = Math.min(dayLow, price);
    dayHigh = Math.max(dayHigh, price);
  }

  return { open, dayLow, dayHigh };
}

export async function getAllStocks(): Promise<Pick<Stock, "ticker" | "companyName">[]> {
  if (!stockConfigCache) {
    await initStockConfigCache();
  }
  return Array.from(stockConfigCache!.values()).map((s) => ({
    ticker: s.ticker,
    companyName: s.companyName,
  }));
}
