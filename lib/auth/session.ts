import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import {
  createSession,
  deleteSession,
  findSession,
  findUserById,
  getRestaurant,
} from "@/lib/db";
import type { Restaurant, User } from "@/lib/types";

/**
 * Cookie-backed sign-in.
 *
 * The cookie holds `<sessionId>.<signature>`. The id is only trusted once the
 * signature verifies, and is then looked up in the store — so ending a session
 * on the server takes effect immediately, everywhere.
 */

export const SESSION_COOKIE = "d360_session";

function secret(): string {
  // A stable fallback keeps local sign-ins working across restarts. Anything
  // deployed must set AUTH_SECRET — see `.env.example`.
  return (
    process.env.AUTH_SECRET ?? "dish360-local-development-secret-not-for-deployment"
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function serialise(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

function parse(token: string | undefined): string | null {
  if (!token) return null;
  const cut = token.lastIndexOf(".");
  if (cut <= 0) return null;

  const id = token.slice(0, cut);
  const signature = token.slice(cut + 1);
  const expected = sign(id);
  if (signature.length !== expected.length) return null;

  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return id;
}

export interface AuthContext {
  user: User;
  restaurant: Restaurant;
}

/**
 * Who is signed in for this request.
 * `cache` dedupes the lookup across every component in one render.
 */
export const getAuth = cache(async (): Promise<AuthContext | null> => {
  const sessionId = parse(cookies().get(SESSION_COOKIE)?.value);
  if (!sessionId) return null;

  const session = await findSession(sessionId);
  if (!session) return null;

  const user = await findUserById(session.userId);
  if (!user) return null;

  const restaurant = await getRestaurant(user.restaurantId);
  if (!restaurant) return null;

  return { user, restaurant };
});

/** Throws when nobody is signed in. */
export async function requireAuth(): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) throw new Error("NOT_SIGNED_IN");
  return auth;
}

export async function startSession(userId: string): Promise<void> {
  const session = await createSession(userId);
  cookies().set(SESSION_COOKIE, serialise(session.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export async function endSession(): Promise<void> {
  const sessionId = parse(cookies().get(SESSION_COOKIE)?.value);
  if (sessionId) await deleteSession(sessionId);
  cookies().delete(SESSION_COOKIE);
}
