"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Check, LoaderCircle } from "lucide-react";
import { requestDemoAction, type DemoState } from "./actions";
import { Button, ButtonLink, ErrorNote, FieldLabel, FIELD, GlassCard, Lede } from "@/components/app/ui";

const EMPTY: DemoState = {};

export default function DemoForm() {
  const [state, action] = useFormState(requestDemoAction, EMPTY);

  if (state.done) {
    return (
      <GlassCard className="w-full max-w-md p-8 text-center sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sage/[0.16] text-sage">
          <Check className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-ink">Thank you</h1>
        <Lede className="mt-2">
          We will be in touch within a working day to set up a time. Meanwhile you can make
          an account and try it on a few dishes yourself.
        </Lede>
        <div className="mt-7 flex flex-col gap-3">
          <ButtonLink href="/signup" size="lg">Try it now</ButtonLink>
          <ButtonLink href="/" variant="ghost" size="lg">Back to the home page</ButtonLink>
        </div>
      </GlassCard>
    );
  }

  const field = (name: string) => state.fieldErrors?.[name];

  return (
    <GlassCard className="w-full max-w-lg p-8 sm:p-10">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Book a demo</h1>
      <Lede className="mt-2">
        Tell us about your place. We will show you Dish360 on a few of your own dishes.
      </Lede>

      <form action={action} className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* Hidden from people; bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="name">Your name</FieldLabel>
          <input id="name" name="name" autoComplete="name" required className={FIELD} />
          <ErrorNote>{field("name")}</ErrorNote>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="phone" hint="optional">Phone</FieldLabel>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={FIELD} />
          <ErrorNote>{field("phone")}</ErrorNote>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input id="email" name="email" type="email" autoComplete="email" required className={FIELD} />
          <ErrorNote>{field("email")}</ErrorNote>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="restaurantName">Restaurant</FieldLabel>
          <input id="restaurantName" name="restaurantName" autoComplete="organization" required className={FIELD} />
          <ErrorNote>{field("restaurantName")}</ErrorNote>
        </div>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="city" hint="optional">City</FieldLabel>
          <input id="city" name="city" autoComplete="address-level2" className={FIELD} />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <FieldLabel htmlFor="message" hint="optional">Anything we should know</FieldLabel>
          <textarea id="message" name="message" rows={3} className={FIELD} placeholder="How many tables, what you serve, when suits you" />
          <ErrorNote>{field("message")}</ErrorNote>
        </div>
        <div className="sm:col-span-2">
          <ErrorNote>{state.error}</ErrorNote>
          <Submit />
        </div>
      </form>

      <p className="mt-6 text-center text-[13px] text-ink-dim">
        Already on Dish360?{" "}
        <Link href="/signin" className="font-semibold text-sage hover:underline">Sign in</Link>
      </p>
    </GlassCard>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Send"}
    </Button>
  );
}
