"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createRestaurant,
  createUser,
  findUserByEmail,
  queueMail,
  slugAvailable,
} from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { endSession, startSession } from "@/lib/auth/session";
import { slugify } from "@/lib/utils";

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

  const user = await findUserByEmail(parsed.data.email);
  if (!user) return noMatch;
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return noMatch;

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
  const base = slugify(parsed.data.restaurantName) || "menu";
  let slug = base;
  let suffix = 2;
  while (!(await slugAvailable(slug))) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  const restaurant = await createRestaurant({
    name: parsed.data.restaurantName,
    slug,
    city: parsed.data.city,
    plan: "free",
    published: false,
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
    // Nothing is sent until an email provider is connected; the message waits
    // in the outbox, which the owner can read under Settings.
    await queueMail({
      to: user.email,
      subject: "Reset your Dish360 password",
      body: [
        `Hello ${user.name},`,
        "",
        "Somebody asked to reset the password on your Dish360 account.",
        "",
        "Email is not connected on this deployment yet, so no link was sent.",
        "Connect an email provider and this becomes a real reset link.",
        "",
        "— Dish360",
      ].join("\n"),
    });
  }

  // Same answer whether or not the address exists.
  return { done: parsed.data.email };
}
