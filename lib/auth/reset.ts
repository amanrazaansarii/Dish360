import { createHash, randomBytes } from "node:crypto";
import { createPasswordReset, queueMail } from "@/lib/db";
import { siteOrigin } from "@/lib/site";
import type { User } from "@/lib/types";

/**
 * Single-use password-reset links.
 *
 * The token goes out in the link and only its SHA-256 is stored, so a copy of
 * the database cannot be turned into a way in. A link lasts an hour and works
 * once; using it signs the account out everywhere else.
 */

const LIFETIME_MS = 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Makes a link and puts the email for it in the outbox. Returns the link. */
export async function issueResetLink(user: User, reason: "asked" | "admin" = "asked"): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await createPasswordReset({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + LIFETIME_MS).toISOString(),
  });
  const link = `${siteOrigin()}/reset-password?token=${token}`;

  await queueMail({
    to: user.email,
    subject: "Reset your Dish360 password",
    body: [
      `Hello ${user.name},`,
      "",
      reason === "admin"
        ? "Dish360 support made you a link to set a new password."
        : "Somebody asked to reset the password on your Dish360 account. If it was you, open this link within the hour:",
      "",
      link,
      "",
      "It works once. If you did not ask for this, ignore it and nothing changes.",
      "",
      "— Dish360",
    ].join("\n"),
  });
  return link;
}
