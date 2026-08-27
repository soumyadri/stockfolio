import { authResolvers } from "./auth.js";
import { orderResolvers } from "./order.js";
import { portfolioResolvers } from "./portfolio.js";
import { quoteResolvers } from "./quote.js";
import { watchlistResolvers } from "./watchlist.js";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...quoteResolvers.Query,
    ...portfolioResolvers.Query,
    ...watchlistResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...watchlistResolvers.Mutation,
  },
};
