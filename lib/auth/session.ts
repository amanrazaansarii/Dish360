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
import { isPlatformAdmin } from "./roles";

/**
 * Cookie-backed sign-in.
 *
 * The cookie holds `<sessionId>.<signature>`. The id is only trusted once the
 * signature verifies, and is then looked up in the store — so ending a session
 * on the server takes effect immediately, everywhere.
 */

export const SESSION_COOKIE = "d360_session";
/**
 * Set when a platform admin opens a restaurant's dashboard from /admin. Holds
 * `<restaurantId>.<signature>`, signed together with the session id, so it is
 * useless to anyone else and dies with the session.
 */
export const ACT_AS_COOKIE = "d360_act";

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
  /** the restaurant the dashboard is working on */
  restaurant: Restaurant;
  /** the user runs Dish360 itself (see lib/auth/roles.ts) */
  admin: boolean;
  /** an admin looking at somebody else's restaurant */
  acting: boolean;
}

function actSignature(sessionId: string, restaurantId: string): string {
  return sign(`act:${sessionId}:${restaurantId}`);
}

function actingRestaurantId(sessionId: string): string | null {
  const raw = cookies().get(ACT_AS_COOKIE)?.value;
  if (!raw) return null;
  const cut = raw.lastIndexOf(".");
  if (cut <= 0) return null;
  const id = raw.slice(0, cut);
  const given = raw.slice(cut + 1);
  const expected = actSignature(sessionId, id);
  if (given.length !== expected.length) return null;
  try {
    return timingSafeEqual(Buffer.from(given), Buffer.from(expected)) ? id : null;
  } catch {
    return null;
  }
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

  const admin = isPlatformAdmin(user);
  if (admin) {
    const actingId = actingRestaurantId(session.id);
    if (actingId && actingId !== user.restaurantId) {
      const other = await getRestaurant(actingId);
      if (other) return { user, restaurant: other, admin, acting: true };
    }
  }

  const restaurant = await getRestaurant(user.restaurantId);
  if (!restaurant) return null;

  return { user, restaurant, admin, acting: false };
});

/** For /admin: work on this restaurant's dashboard as if signed in to it. */
export async function startActingAs(restaurantId: string): Promise<boolean> {
  const sessionId = parse(cookies().get(SESSION_COOKIE)?.value);
  if (!sessionId) return false;
  cookies().set(ACT_AS_COOKIE, `${restaurantId}.${actSignature(sessionId, restaurantId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return true;
}

export function stopActing(): void {
  cookies().delete(ACT_AS_COOKIE);
}

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
  cookies().delete(ACT_AS_COOKIE);
}
