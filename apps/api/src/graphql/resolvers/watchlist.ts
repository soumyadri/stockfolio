import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";
import { badUserInput } from "../errors.js";
import { getAllStocks } from "../../services/priceService.js";

async function assertKnownTicker(ticker: string): Promise<string> {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) {
    throw badUserInput("Ticker is required");
  }

  const stocks = await getAllStocks();
  if (!stocks.some((stock) => stock.ticker === normalized)) {
    throw badUserInput(`Unknown ticker: ${normalized}`);
  }

  return normalized;
}

export const watchlistResolvers = {
  Query: {
    watchlist: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const items = await context.prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { ticker: true },
      });
      return items.map((item) => item.ticker);
    },
  },

  Mutation: {
    addToWatchlist: async (
      _parent: unknown,
      args: { ticker: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const ticker = await assertKnownTicker(args.ticker);

      await context.prisma.watchlistItem.upsert({
        where: { userId_ticker: { userId, ticker } },
        update: {},
        create: { userId, ticker },
      });

      const items = await context.prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { ticker: true },
      });
      return items.map((item) => item.ticker);
    },

    removeFromWatchlist: async (
      _parent: unknown,
      args: { ticker: string },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const ticker = args.ticker.trim().toUpperCase();

      await context.prisma.watchlistItem.deleteMany({
        where: { userId, ticker },
      });

      const items = await context.prisma.watchlistItem.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { ticker: true },
      });
      return items.map((item) => item.ticker);
    },
  },
};
