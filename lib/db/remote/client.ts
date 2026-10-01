import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase connection the server uses.
 *
 * Dish360 does its own sign-in — scrypt hashes and a signed cookie — so the
 * database is only ever reached from the server, with the service role. That
 * key must never be sent to a browser, which is why it has no NEXT_PUBLIC_
 * prefix: Next.js will refuse to inline it into client code.
 *
 * Row level security is on for every table with no policies, so the anon key
 * that does ship to browsers cannot read anything.
 */

export interface SupabaseSettings {
  url: string;
  serviceRoleKey: string;
}

/** The settings, or a sentence explaining what is missing. */
export function readSupabaseSettings():
  | { ok: true; settings: SupabaseSettings }
  | { ok: false; missing: string[] } {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  if (missing.length > 0) return { ok: false, missing };
  return { ok: true, settings: { url, serviceRoleKey } };
}

export function supabaseConfigured(): boolean {
  return readSupabaseSettings().ok;
}

/**
 * One client per process. Kept on globalThis because route handlers, pages and
 * Server Actions can each be bundled separately — module scope is duplicated
 * across those graphs, and a client per graph means a connection pool per graph.
 */
const CLIENT = Symbol.for("dish360.supabase");
type Holder = typeof globalThis & { [CLIENT]?: SupabaseClient };

export function supabase(): SupabaseClient {
  const holder = globalThis as Holder;
  if (holder[CLIENT]) return holder[CLIENT];

  const result = readSupabaseSettings();
  if (!result.ok) {
    throw new Error(
      `Supabase is not configured. Missing: ${result.missing.join(", ")}. ` +
        `Set them, or unset DATA_BACKEND to use the local file store in development.`,
    );
  }

  holder[CLIENT] = createClient(result.settings.url, result.settings.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "dish360" } },
  });
  return holder[CLIENT];
}

/** Turns a PostgrestError into something worth reading in a log. */
export function fail(what: string, error: { message: string; hint?: string | null }): never {
  throw new Error(
    `Supabase could not ${what}: ${error.message}${error.hint ? ` (${error.hint})` : ""}`,
  );
}
