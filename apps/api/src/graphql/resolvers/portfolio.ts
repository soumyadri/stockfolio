import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";
import { getCurrentPrice, getPriceAtTime } from "../../services/priceService.js";

export const portfolioResolvers = {
  Query: {
    portfolio: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const wallet = await context.prisma.wallet.findUnique({ where: { userId } });
      const holdings = await context.prisma.holding.findMany({ where: { userId } });

      const holdingItems = await Promise.all(
        holdings.map(async (h) => {
          const currentPrice = await getCurrentPrice(h.ticker);
          const quantity = Number(h.quantity);
          return {
            ticker: h.ticker,
            quantity,
            avgCost: Number(h.avgCost),
            currentPrice,
            marketValue: +(quantity * currentPrice).toFixed(2),
          };
        }),
      );

      const holdingsValue = +holdingItems.reduce((sum, h) => sum + h.marketValue, 0).toFixed(2);
      const cashBalance = wallet ? Number(wallet.balance) : 0;
      const totalValue = +(cashBalance + holdingsValue).toFixed(2);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      let holdingsValueAtStart = 0;
      for (const h of holdings) {
        const priceAtStart = await getPriceAtTime(h.ticker, startOfDay.getTime());
        holdingsValueAtStart += Number(h.quantity) * priceAtStart;
      }

      const totalAtStart = +(cashBalance + holdingsValueAtStart).toFixed(2);
      const todayGain = +(totalValue - totalAtStart).toFixed(2);

      const costBasis = +holdingItems.reduce((sum, h) => sum + h.quantity * h.avgCost, 0).toFixed(2);
      const totalReturnPercent =
        costBasis > 0 ? +(((holdingsValue - costBasis) / costBasis) * 100).toFixed(2) : 0;

      return {
        cashBalance,
        holdingsValue,
        totalValue,
        todayGain,
        totalReturnPercent,
        holdings: holdingItems,
      };
    },

    transactions: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const rows = await context.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return rows.map((t) => ({
        id: t.id,
        date: t.createdAt.toISOString(),
        ticker: t.ticker,
        side: t.side,
        quantity: Number(t.quantity),
        price: Number(t.price),
        total: +(Number(t.quantity) * Number(t.price)).toFixed(2),
      }));
    },
  },
};
