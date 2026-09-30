"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { LoaderCircle, Mail } from "lucide-react";
import { forgotPasswordAction, type FormState } from "../actions";
import {
  Button,
  ButtonLink,
  ErrorNote,
  FieldLabel,
  FIELD,
  GlassCard,
  Lede,
  Well,
} from "@/components/app/ui";

const EMPTY: FormState = {};

export default function ForgotForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, EMPTY);

  if (state.done) {
    return (
      <GlassCard className="w-full max-w-md p-8 sm:p-10">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
          Check your email
        </h1>

        <Well className="mt-6 flex items-start gap-3 p-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
          <p className="text-[13.5px] leading-relaxed text-ink-plain">
            If there is an account for{" "}
            <span className="font-semibold text-ink">{state.done}</span>, a reset message
            is on its way to it.
          </p>
        </Well>

        <p className="mt-4 text-[12px] leading-relaxed text-ink-dim">
          Email is not connected on this deployment yet, so the message is waiting in the
          outbox instead of an inbox. An account owner can read it under Settings.
        </p>

        <ButtonLink href="/signin" size="lg" className="mt-6 w-full">
          Back to sign in
        </ButtonLink>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-md p-8 sm:p-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
        Forgot your password?
      </h1>
      <Lede className="mt-2">
        Put in the email on the account and we will send a link to set a new one.
      </Lede>

      <form action={formAction} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={FIELD}
            placeholder="you@yourplace.com"
          />
          <ErrorNote>{state.fieldErrors?.email}</ErrorNote>
        </div>
        <Submit />
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-dim">
        Remembered it?{" "}
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
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Send the link"}
    </Button>
  );
}
