import type { User } from "@prisma/client";
import type { GraphQLContext } from "../../context.js";
import { comparePassword, hashPassword, signToken } from "../../lib/auth.js";
import { badUserInput, unauthenticated } from "../errors.js";

const INITIAL_BALANCE = 1000;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toGraphQLUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    isDemo: user.isDemo,
    createdAt: user.createdAt.toISOString(),
  };
}

function validateEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw badUserInput("Invalid email address");
  }
}

function validatePassword(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw badUserInput("Password must be at least 8 characters");
  }
}

export const authResolvers = {
  Query: {
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (context.hasInvalidToken) {
        throw unauthenticated("Invalid or expired token");
      }

      if (!context.userId) {
        return null;
      }

      const user = await context.prisma.user.findUnique({
        where: { id: context.userId },
      });

      if (!user) {
        throw unauthenticated("Invalid or expired token");
      }

      return toGraphQLUser(user);
    },
  },

  Mutation: {
    register: async (
      _parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      validateEmail(email);
      validatePassword(args.password);

      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw badUserInput("Email already registered");
      }

      const passwordHash = await hashPassword(args.password);

      const user = await context.prisma.$transaction(async (tx) => {
        return tx.user.create({
          data: {
            email,
            passwordHash,
            isDemo: false,
            wallet: {
              create: {
                balance: INITIAL_BALANCE,
                transactions: {
                  create: {
                    type: "CREDIT",
                    amount: INITIAL_BALANCE,
                    balanceAfter: INITIAL_BALANCE,
                    reference: "Initial wallet funding",
                  },
                },
              },
            },
          },
        });
      });

      const token = signToken(user.id);

      return {
        token,
        user: toGraphQLUser(user),
      };
    },

    login: async (
      _parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();

      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw unauthenticated("Invalid email or password");
      }

      const isValidPassword = await comparePassword(args.password, user.passwordHash);

      if (!isValidPassword) {
        throw unauthenticated("Invalid email or password");
      }

      const token = signToken(user.id);

      return {
        token,
        user: toGraphQLUser(user),
      };
    },
  },
};
