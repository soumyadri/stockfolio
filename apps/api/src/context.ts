import type { Request } from "express";
import type { PrismaClient } from "@prisma/client";
import { verifyToken } from "./lib/auth.js";
import { prisma } from "./lib/prisma.js";

export interface GraphQLContext {
  userId: string | null;
  hasInvalidToken: boolean;
  prisma: PrismaClient;
}

function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

export function createContext(req: Request): GraphQLContext {
  const token = extractBearerToken(req.headers.authorization);
  let userId: string | null = null;
  let hasInvalidToken = false;

  if (token) {
    try {
      userId = verifyToken(token);
    } catch {
      hasInvalidToken = true;
    }
  }

  return {
    userId,
    hasInvalidToken,
    prisma,
  };
}
