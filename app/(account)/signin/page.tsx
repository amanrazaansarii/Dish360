import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in · Dish360",
  description: "Sign in to your Dish360 menu.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  // Already signed in — no reason to show the form.
  if (await getAuth()) redirect(safeNext || "/dashboard");

  return <SignInForm next={safeNext} />;
}
