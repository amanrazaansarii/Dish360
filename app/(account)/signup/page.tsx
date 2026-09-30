import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Create your account · Dish360",
  description: "Put your menu into 3D. Nothing is visible until you publish it.",
};

export default async function SignUpPage() {
  if (await getAuth()) redirect("/dashboard");
  return <SignUpForm />;
}
