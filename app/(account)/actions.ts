"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createRestaurant,
  createUser,
  deleteSessionsForUser,
  findPasswordReset,
  findUserByEmail,
  findUserById,
  getRestaurant,
  queueMail,
  slugAvailable,
  updateRestaurant,
  updateUser,
  usePasswordReset,
} from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { endSession, startSession } from "@/lib/auth/session";
import { hashToken, issueResetLink } from "@/lib/auth/reset";
import { startingSubscription } from "@/lib/plans";
import { slugify } from "@/lib/utils";
import type { User } from "@/lib/types";

/**
 * Signing in and creating an account.
 *
 * Each action returns `{ error }` rather than throwing, so the form can show
 * the problem next to the field and keep what was typed.
 */

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  done?: string;
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

/* -------------------------------------------------------------- sign in --- */

async function freeSlug(name: string): Promise<string> {
  const base = slugify(name) || "menu";
  let slug = base;
  let suffix = 2;
  while (!(await slugAvailable(slug))) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

/**
 * The platform admin's account, made on first sign-in if it is not there.
 *
 * Its email and password hash come from the host's environment
 * (DISH360_ADMIN_EMAIL, DISH360_ADMIN_PASSWORD_HASH), so the same login works
 * on a laptop and on a fresh deployment with an empty database. Returns the
 * account when these credentials are the admin's, otherwise null and the
 * normal sign-in carries on.
 *
 * The environment's password always opens the admin account, even after it is
 * changed in Settings: it is the way back in.
 */
async function platformAdminSignIn(email: string, password: string): Promise<User | null> {
  const adminEmail = process.env.DISH360_ADMIN_EMAIL?.trim().toLowerCase();
  const adminHash = process.env.DISH360_ADMIN_PASSWORD_HASH?.trim();
  if (!adminEmail || !adminHash || email.trim().toLowerCase() !== adminEmail) return null;
  if (!(await verifyPassword(password, adminHash))) return null;

  const existing = await findUserByEmail(adminEmail);
  if (existing) return existing;

  // A local store seeded before the admin was configured: take over the sample
  // café's login, so one account runs the admin panel and the demo café.
  const sample = await findUserByEmail("owner@copperleaf.test");
  if (sample) {
    const cafe = await getRestaurant(sample.restaurantId);
    if (cafe && cafe.subscription.status !== "comped") {
      await updateRestaurant(cafe.id, {
        subscription: { ...cafe.subscription, status: "comped", note: "Dish360 demo café" },
      });
    }
    return updateUser(sample.id, { email: adminEmail, passwordHash: adminHash, name: "Dish360 admin" });
  }

  // An empty database (a new deployment): give the admin a demo café of their own.
  const restaurant = await createRestaurant({
    name: "Dish360 Demo Café",
    slug: await freeSlug("dish360-demo"),
    plan: "enterprise",
    published: false,
    subscription: { ...startingSubscription({ status: "comped" }), note: "Dish360 demo café" },
  });
  return createUser({
    email: adminEmail,
    name: "Dish360 admin",
    passwordHash: adminHash,
    restaurantId: restaurant.id,
    role: "owner",
  });
}

const signInSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("That does not look like an email"),
  password: z.string().min(1, "Enter your password"),
});

export async function signInAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error), values: { email: raw.email } };
  }

  // The same message either way. Telling someone which half was wrong tells an
  // attacker which emails have accounts.
  const noMatch: FormState = {
    error: "That email and password do not match an account.",
    values: { email: raw.email },
  };

  const admin = await platformAdminSignIn(parsed.data.email, parsed.data.password);
  const user = admin ?? (await findUserByEmail(parsed.data.email));
  if (!user) return noMatch;
  if (!admin && !(await verifyPassword(parsed.data.password, user.passwordHash))) return noMatch;

  await startSession(user.id);

  // Back to wherever they were headed, but only inside this site — an absolute
  // URL here would be an open redirect.
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

/* ------------------------------------------------------------ create it --- */

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().min(1, "Enter your email").email("That does not look like an email"),
  password: z.string().min(8, "Use at least 8 characters").max(200, "That is too long"),
  restaurantName: z.string().trim().min(2, "Enter the name of your place"),
  city: z.string().trim().optional().default(""),
});

export async function signUpAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    restaurantName: String(formData.get("restaurantName") ?? ""),
    city: String(formData.get("city") ?? ""),
  };
  const keep = {
    name: raw.name,
    email: raw.email,
    restaurantName: raw.restaurantName,
    city: raw.city,
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error), values: keep };
  }

  if (await findUserByEmail(parsed.data.email)) {
    return {
      fieldErrors: { email: "There is already an account with that email." },
      values: keep,
    };
  }

  // The slug becomes a public web address, so a clash gets a number rather
  // than an error the owner has to solve.
  const slug = await freeSlug(parsed.data.restaurantName);

  // Everyone starts on Starter, which is free, so there is nothing to trial:
  // the subscription is simply active. A paid plan is agreed with Dish360 and
  // set from the admin panel.
  const restaurant = await createRestaurant({
    name: parsed.data.restaurantName,
    slug,
    city: parsed.data.city,
    plan: "free",
    published: false,
    subscription: startingSubscription({ status: "active" }),
  });

  const user = await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password),
    restaurantId: restaurant.id,
    role: "owner",
  });

  await queueMail({
    to: user.email,
    subject: `${restaurant.name} is set up on Dish360`,
    body: [
      `Hello ${user.name},`,
      "",
      `Your account is ready. When you publish it, your menu will be at /m/${restaurant.slug}.`,
      "",
      "Next: add a dish, let us build the 3D, check it, then print a code for one table.",
      "",
      "— Dish360",
    ].join("\n"),
  });

  await startSession(user.id);
  redirect("/dashboard?new=1");
}

/* ------------------------------------------------------------- sign out --- */

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

/* -------------------------------------------------------- forgot it all --- */

const forgotSchema = z.object({
  email: z.string().trim().min(1, "Enter your email").email("That does not look like an email"),
});

export async function forgotPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    // A real, single-use link. Until an email provider is connected it waits
    // in the outbox, which Dish360 support can read in the admin panel and
    // pass on.
    await issueResetLink(user, "asked");
  }

  // Same answer whether or not the address exists.
  return { done: parsed.data.email };
}

/* -------------------------------------------------------- set a new one --- */

export async function resetPasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { fieldErrors: { password: "Use at least 8 characters" } };
  if (password.length > 200) return { fieldErrors: { password: "That is too long" } };
  if (password !== confirm) return { fieldErrors: { confirm: "The two passwords are different" } };

  const expired: FormState = {
    error: "This link has expired or has already been used. Ask for a new one.",
  };
  const reset = token ? await findPasswordReset(hashToken(token)) : null;
  if (!reset) return expired;
  const user = await findUserById(reset.userId);
  if (!user) return expired;
  if (!(await usePasswordReset(reset.id))) return expired;

  await updateUser(user.id, { passwordHash: await hashPassword(password) });
  // Anyone who was signed in with the old password is signed out.
  await deleteSessionsForUser(user.id);
  await startSession(user.id);
  redirect("/dashboard?reset=1");
}
