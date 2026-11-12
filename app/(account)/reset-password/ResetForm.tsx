"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { resetPasswordAction, type FormState } from "../actions";
import { Button, ErrorNote, FieldLabel, FIELD, GlassCard, Lede } from "@/components/app/ui";

const EMPTY: FormState = {};

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, EMPTY);

  return (
    <GlassCard className="w-full max-w-md p-8 sm:p-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Set a new password</h1>
      <Lede className="mt-2">
        Choose a new one. Anywhere else this account is signed in will be signed out.
      </Lede>

      {token ? (
        <form action={formAction} className="mt-8 flex flex-col gap-5">
          <input type="hidden" name="token" value={token} />
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="password" hint="At least 8 characters">
              New password
            </FieldLabel>
            <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} className={FIELD} />
            <ErrorNote>{state.fieldErrors?.password}</ErrorNote>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="confirm">Same again</FieldLabel>
            <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={FIELD} />
            <ErrorNote>{state.fieldErrors?.confirm}</ErrorNote>
          </div>
          <ErrorNote>{state.error}</ErrorNote>
          <Submit />
        </form>
      ) : (
        <div className="mt-6">
          <ErrorNote>This page needs the link from the reset email.</ErrorNote>
        </div>
      )}

      <p className="mt-6 text-center text-[13px] text-ink-dim">
        Link not working?{" "}
        <Link href="/forgot-password" className="font-semibold text-sage hover:underline">
          Ask for a new one
        </Link>
      </p>
    </GlassCard>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Save the new password"}
    </Button>
  );
}
