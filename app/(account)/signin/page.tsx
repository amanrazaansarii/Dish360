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
  // Already signed in — no reason to show the form.
  if (await getAuth()) redirect("/dashboard");

  const next = searchParams.next;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "";

  return <SignInForm next={safeNext} />;
}
