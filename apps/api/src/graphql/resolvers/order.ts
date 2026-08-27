import type { OrderSide } from "@prisma/client";
import type { GraphQLContext } from "../../context.js";
import { requireAuth } from "../../lib/requireAuth.js";
import { placeOrder as executeOrder } from "../../services/orderService.js";

export const orderResolvers = {
  Mutation: {
    placeOrder: async (
      _parent: unknown,
      args: { ticker: string; side: OrderSide; quantity: number; confirmedPrice: number },
      context: GraphQLContext,
    ) => {
      const userId = requireAuth(context);
      const order = await executeOrder(
        context.prisma,
        userId,
        args.ticker,
        args.side,
        args.quantity,
        args.confirmedPrice,
      );

      return {
        id: order.id,
        ticker: order.ticker,
        side: order.side,
        quantity: Number(order.quantity),
        filledPrice: Number(order.filledPrice),
        status: order.status,
      };
    },
  },
};
