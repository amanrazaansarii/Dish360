"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { signInAction, type FormState } from "../actions";
import {
  Button,
  ErrorNote,
  FieldLabel,
  FIELD,
  GlassCard,
  Lede,
  Well,
} from "@/components/app/ui";

const EMPTY: FormState = {};

export default function SignInForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(signInAction, EMPTY);

  return (
    <GlassCard className="w-full max-w-md p-8 sm:p-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Sign in</h1>
      <Lede className="mt-2">Your menu, your codes, and what your guests looked at.</Lede>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <input type="hidden" name="next" value={next} />

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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={FIELD}
            placeholder="••••••••"
          />
          <ErrorNote>{state.fieldErrors?.password}</ErrorNote>
        </div>

        <ErrorNote>{state.error}</ErrorNote>
        <Submit />
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-[13px]">
        <Link
          href="/forgot-password"
          className="text-ink-dim transition-colors hover:text-ink-plain"
        >
          Forgot your password?
        </Link>
        <Link href="/signup" className="font-semibold text-sage hover:underline">
          Create an account
        </Link>
      </div>

      <Well className="mt-8 px-4 py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          Try it without signing up
        </p>
        <p className="mt-1.5 font-mono text-[12px] text-ink-plain">
          owner@copperleaf.test
          <span className="mx-2 text-ink-dim">/</span>
          dish360demo
        </p>
      </Well>
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
          Sign in
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}
