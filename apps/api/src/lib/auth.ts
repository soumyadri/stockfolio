import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

const BCRYPT_ROUNDS = 10;
const DEFAULT_JWT_EXPIRES_IN = "30d";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return secret;
}

function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRES_IN) as SignOptions["expiresIn"];
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
}

export function verifyToken(token: string): string {
  const payload = jwt.verify(token, getJwtSecret());

  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Invalid token payload");
  }

  return payload.sub;
}
