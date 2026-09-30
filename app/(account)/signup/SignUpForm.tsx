"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { signUpAction, type FormState } from "../actions";
import {
  Button,
  ErrorNote,
  FieldLabel,
  FIELD,
  GlassCard,
  Lede,
} from "@/components/app/ui";

const EMPTY: FormState = {};

export default function SignUpForm() {
  const [state, formAction] = useFormState(signUpAction, EMPTY);

  return (
    <GlassCard className="w-full max-w-lg p-8 sm:p-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
        Create your account
      </h1>
      <Lede className="mt-2">
        Nothing is visible to anyone until you publish it. Add a dish, look at the 3D,
        and decide from there.
      </Lede>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="name">Your name</FieldLabel>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              defaultValue={state.values?.name ?? ""}
              className={FIELD}
              placeholder="Meera Joshi"
            />
            <ErrorNote>{state.fieldErrors?.name}</ErrorNote>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="restaurantName">Your place</FieldLabel>
            <input
              id="restaurantName"
              name="restaurantName"
              required
              defaultValue={state.values?.restaurantName ?? ""}
              className={FIELD}
              placeholder="Copperleaf Café"
            />
            <ErrorNote>{state.fieldErrors?.restaurantName}</ErrorNote>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state.values?.email ?? ""}
              className={FIELD}
              placeholder="you@yourplace.com"
            />
            <ErrorNote>{state.fieldErrors?.email}</ErrorNote>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="city">City</FieldLabel>
            <input
              id="city"
              name="city"
              autoComplete="address-level2"
              defaultValue={state.values?.city ?? ""}
              className={FIELD}
              placeholder="Pune"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="password" hint="8 characters or more">
            Password
          </FieldLabel>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className={FIELD}
            placeholder="••••••••"
          />
          <ErrorNote>{state.fieldErrors?.password}</ErrorNote>
        </div>

        <ErrorNote>{state.error}</ErrorNote>
        <Submit />
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-dim">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-sage hover:underline">
          Sign in
        </Link>
      </p>
    </GlassCard>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Create account
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
