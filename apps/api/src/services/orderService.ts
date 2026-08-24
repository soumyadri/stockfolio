import type { OrderSide, PrismaClient } from "@prisma/client";
import { badUserInput } from "../graphql/errors.js";
import { getCurrentPrice } from "./priceService.js";

export async function placeOrder(
  prisma: PrismaClient,
  userId: string,
  ticker: string,
  side: OrderSide,
  quantity: number,
) {
  if (quantity <= 0) {
    throw badUserInput("Quantity must be greater than zero");
  }

  const normalizedTicker = ticker.toUpperCase();
  const price = await getCurrentPrice(normalizedTicker);
  const total = +(price * quantity).toFixed(2);

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw badUserInput("Wallet not found");
    }

    if (side === "BUY") {
      if (Number(wallet.balance) < total) {
        throw badUserInput("Insufficient funds");
      }

      const newBalance = +(Number(wallet.balance) - total).toFixed(2);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT",
          amount: total,
          balanceAfter: newBalance,
          reference: `Buy ${quantity} ${normalizedTicker}`,
        },
      });

      const existing = await tx.holding.findUnique({
        where: { userId_ticker: { userId, ticker: normalizedTicker } },
      });

      if (existing) {
        const oldQty = Number(existing.quantity);
        const newQty = oldQty + quantity;
        const newAvgCost = +(
          (oldQty * Number(existing.avgCost) + quantity * price) /
          newQty
        ).toFixed(2);
        await tx.holding.update({
          where: { id: existing.id },
          data: { quantity: newQty, avgCost: newAvgCost },
        });
      } else {
        await tx.holding.create({
          data: {
            userId,
            ticker: normalizedTicker,
            quantity,
            avgCost: price,
          },
        });
      }
    } else {
      const holding = await tx.holding.findUnique({
        where: { userId_ticker: { userId, ticker: normalizedTicker } },
      });

      if (!holding || Number(holding.quantity) < quantity) {
        throw badUserInput("Insufficient shares");
      }

      const newQty = +(Number(holding.quantity) - quantity).toFixed(6);
      if (newQty === 0) {
        await tx.holding.delete({ where: { id: holding.id } });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: { quantity: newQty },
        });
      }

      const newBalance = +(Number(wallet.balance) + total).toFixed(2);
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "CREDIT",
          amount: total,
          balanceAfter: newBalance,
          reference: `Sell ${quantity} ${normalizedTicker}`,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId,
        ticker: normalizedTicker,
        side,
        quantity,
        status: "FILLED",
        filledPrice: price,
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        orderId: order.id,
        ticker: normalizedTicker,
        side,
        quantity,
        price,
      },
    });

    return order;
  });
}
