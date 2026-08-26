import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";
import { badUserInput } from "../errors.js";
import { getPortfolioSummary } from "../../services/portfolioService.js";

export const portfolioResolvers = {
  Query: {
    portfolio: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      return getPortfolioSummary(context.prisma, userId);
    },

    transactions: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const rows = await context.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
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

    wallet: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuth(context);
      const summary = await getPortfolioSummary(context.prisma, userId);

      const wallet = await context.prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        throw badUserInput("Wallet not found");
      }

      const [ledgerRows, tradeRows] = await Promise.all([
        context.prisma.walletTransaction.findMany({
          where: { walletId: wallet.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        context.prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ]);

      return {
        ...summary,
        ledger: ledgerRows.map((entry) => ({
          id: entry.id,
          date: entry.createdAt.toISOString(),
          type: entry.type,
          amount: Number(entry.amount),
          balanceAfter: Number(entry.balanceAfter),
          reference: entry.reference,
        })),
        trades: tradeRows.map((t) => ({
          id: t.id,
          date: t.createdAt.toISOString(),
          ticker: t.ticker,
          side: t.side,
          quantity: Number(t.quantity),
          price: Number(t.price),
          total: +(Number(t.quantity) * Number(t.price)).toFixed(2),
        })),
      };
    },
  },
};
