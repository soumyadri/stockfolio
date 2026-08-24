import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";
import { badUserInput } from "../errors.js";
import {
  getAllStocks,
  getCurrentPrice,
  getDayStats,
  getPriceAtTime,
  getPriceHistory,
} from "../../services/priceService.js";

async function resolveQuotes(
  tickers: string[],
  userId: string | null,
  context: GraphQLContext,
) {
  const normalized = tickers.map((t) => t.trim().toUpperCase()).filter(Boolean);
  if (normalized.length === 0) {
    return [];
  }

  const uniqueTickers = [...new Set(normalized)];
  const stocks = await getAllStocks();
  const stockMap = new Map(stocks.map((s) => [s.ticker, s]));

  for (const ticker of uniqueTickers) {
    if (!stockMap.has(ticker)) {
      throw badUserInput(`Unknown ticker: ${ticker}`);
    }
  }

  const holdingsMap = new Map<string, number>();
  if (userId) {
    const holdings = await context.prisma.holding.findMany({
      where: { userId, ticker: { in: uniqueTickers } },
    });
    for (const holding of holdings) {
      holdingsMap.set(holding.ticker, Number(holding.quantity));
    }
  }

  const quotesByTicker = new Map<
    string,
    {
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
  >();
  await Promise.all(
    uniqueTickers.map(async (ticker) => {
      const stock = stockMap.get(ticker)!;
      const price = await getCurrentPrice(ticker);
      const priorPrice = await getPriceAtTime(ticker, Date.now() - 86400000);
      const changeAmount = +(price - priorPrice).toFixed(2);
      const changePercent = +(((price - priorPrice) / priorPrice) * 100).toFixed(2);
      const { open, dayLow, dayHigh } = await getDayStats(ticker);

      quotesByTicker.set(ticker, {
        ticker,
        companyName: stock.companyName,
        price,
        changePercent,
        changeAmount,
        open,
        dayLow,
        dayHigh,
        sharesOwned: holdingsMap.get(ticker) ?? 0,
      });
    }),
  );

  const orderedTickers = normalized.filter((ticker, index) => normalized.indexOf(ticker) === index);
  return orderedTickers.map((ticker) => quotesByTicker.get(ticker)!);
}

async function resolveQuote(ticker: string, userId: string | null, context: GraphQLContext) {
  const [quote] = await resolveQuotes([ticker], userId, context);
  return quote;
}

export const quoteResolvers = {
  Query: {
    stocks: async () => getAllStocks(),

    quote: async (
      _parent: unknown,
      args: { ticker: string },
      context: GraphQLContext,
    ) => resolveQuote(args.ticker, context.userId, context),

    quotes: async (
      _parent: unknown,
      args: { tickers: string[] },
      context: GraphQLContext,
    ) => resolveQuotes(args.tickers, context.userId, context),

    priceHistory: async (_parent: unknown, args: { ticker: string; days: number }) => {
      return getPriceHistory(args.ticker, args.days);
    },

    watchlistQuotes: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const items = await context.prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      });
      return resolveQuotes(
        items.map((item) => item.ticker),
        userId,
        context,
      );
    },
  },
};
