import type { GraphQLContext } from "../context.js";
import { unauthenticated } from "../graphql/errors.js";

export function requireAuth(context: GraphQLContext): string {
  if (context.hasInvalidToken) {
    throw unauthenticated("Invalid or expired token");
  }
  if (!context.userId) {
    throw unauthenticated("Authentication required");
  }
  return context.userId;
}
