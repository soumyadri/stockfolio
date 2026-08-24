import { authResolvers } from "./auth.js";
import { orderResolvers } from "./order.js";
import { portfolioResolvers } from "./portfolio.js";
import { quoteResolvers } from "./quote.js";

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...quoteResolvers.Query,
    ...portfolioResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...orderResolvers.Mutation,
  },
};
