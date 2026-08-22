import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dayflow-super-secret-hrms-key-2026-secure";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = "dayflow_token";

export interface TokenPayload {
  id: string;
  loginId: string;
  email: string;
  name: string;
  role: "EMPLOYEE" | "ADMIN";
  mustChangePassword: boolean;
  department?: string;
  company?: string;
  profilePicture?: string | null;
}

/**
 * Sign JWT using jsonwebtoken (Node.js API routes)
 */
export function signJwt(payload: TokenPayload, expiresIn: jwt.SignOptions["expiresIn"] = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT using jsonwebtoken (Node.js API routes)
 */
export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify JWT using jose (Edge runtime / middleware compatible)
 */
export async function verifyJwtEdge(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Sign JWT using jose (Universal / Edge compatible)
 */
export async function signJwtEdge(payload: TokenPayload, expiresIn: string = "7d"): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(SECRET_KEY);
}
