import { notFound, redirect } from "next/navigation";
import { getAuth, type AuthContext } from "./session";

/**
 * The gate in front of /admin and every admin action.
 *
 * Signed out: off to sign in. Signed in but not an admin: a plain 404, so the
 * panel does not even admit to existing.
 */
export async function requireAdmin(next = "/admin"): Promise<AuthContext> {
  const auth = await getAuth();
  if (!auth) redirect(`/signin?next=${encodeURIComponent(next)}`);
  if (!auth.admin) notFound();
  return auth;
}
