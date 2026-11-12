/**
 * Who runs Dish360 itself, as opposed to a restaurant on it.
 *
 * Decided by the host's environment, not by anything stored: an account is a
 * platform admin when its email is DISH360_ADMIN_EMAIL (or one of the comma
 * separated DISH360_ADMIN_EMAILS). Nobody can make themselves an admin from
 * inside the app, and the repository — which is public — names nobody.
 */
export function adminEmails(): string[] {
  const listed = [process.env.DISH360_ADMIN_EMAIL ?? "", ...(process.env.DISH360_ADMIN_EMAILS ?? "").split(",")];
  return listed.map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isPlatformAdmin(user: { email: string } | null | undefined): boolean {
  if (!user) return false;
  return adminEmails().includes(user.email.trim().toLowerCase());
}
