import { headers } from "next/headers";

/**
 * The public origin for links that leave the page: printed table codes,
 * password-reset links. NEXT_PUBLIC_SITE_URL wins; otherwise whatever host this
 * request arrived on, which in development is the dev server.
 */
export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  const host = headers().get("host") ?? "localhost:3000";
  const scheme = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${scheme}://${host}`;
}
