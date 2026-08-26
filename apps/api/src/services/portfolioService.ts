import type { PrismaClient } from "@prisma/client";
import { getCurrentPrice, getPriceAtTime } from "./priceService.js";

export async function getPortfolioSummary(prisma: PrismaClient, userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  const holdings = await prisma.holding.findMany({ where: { userId } });

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
}
