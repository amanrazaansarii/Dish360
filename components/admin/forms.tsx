"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Copy, LoaderCircle } from "lucide-react";
import {
  deleteRestaurantAction,
  recordPaymentAction,
  sendResetLinkAction,
  updateLeadAction,
  updatePlansAction,
  updatePlatformAction,
  updateSubscriptionAction,
  type AdminState,
} from "@/app/admin/actions";
import { Button, DoneNote, ErrorNote, FieldLabel, FIELD } from "@/components/app/ui";
import { cn, formatMoney, toMajor } from "@/lib/utils";
import type { Lead, PlanConfig, PlatformSettings, Subscription } from "@/lib/types";

const EMPTY: AdminState = {};
const SMALL = FIELD.replace("px-4 py-3", "px-3 py-2.5");

function Save({ label = "Save", size = "md" }: { label?: string; size?: "sm" | "md" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} disabled={pending}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
}

function day(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

/* ------------------------------------------------------------ subscription --- */

export function SubscriptionForm({
  restaurantId,
  plan,
  plans,
  subscription,
  currency,
}: {
  restaurantId: string;
  plan: string;
  plans: PlanConfig[];
  subscription: Subscription;
  currency: string;
}) {
  const [state, action] = useFormState(updateSubscriptionAction, EMPTY);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="plan">Plan</FieldLabel>
        <select id="plan" name="plan" defaultValue={plan} className={SMALL}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.priceMonthlyMinor === 0 ? "free" : `${formatMoney(p.priceMonthlyMinor, currency)}/mo`}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="status">Status</FieldLabel>
        <select id="status" name="status" defaultValue={subscription.status} className={SMALL}>
          <option value="trial">Trial</option>
          <option value="active">Active (paying)</option>
          <option value="past_due">Payment late</option>
          <option value="cancelled">Cancelled</option>
          <option value="comped">On the house</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="interval">Billed</FieldLabel>
        <select id="interval" name="interval" defaultValue={subscription.interval} className={SMALL}>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="customPrice" hint="blank = list price">
          Their price ({currency})
        </FieldLabel>
        <input
          id="customPrice"
          name="customPrice"
          inputMode="decimal"
          defaultValue={subscription.customPriceMinor === null ? "" : toMajor(subscription.customPriceMinor)}
          placeholder="List price"
          className={SMALL}
        />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="renewsAt" hint="trial end for a trial">
          Next payment due
        </FieldLabel>
        <input id="renewsAt" name="renewsAt" type="date" defaultValue={day(subscription.renewsAt)} className={SMALL} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <FieldLabel htmlFor="note">Note</FieldLabel>
        <input id="note" name="note" defaultValue={subscription.note} placeholder="Deal terms, contact, anything" className={SMALL} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Save label="Save the subscription" />
        <ErrorNote>{state.error}</ErrorNote>
        <DoneNote>{state.done}</DoneNote>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------- payment --- */

export function PaymentForm({
  restaurantId,
  suggested,
  currency,
}: {
  restaurantId: string;
  /** minor units */
  suggested: number;
  currency: string;
}) {
  const [state, action] = useFormState(recordPaymentAction, EMPTY);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="amount">Amount ({currency})</FieldLabel>
        <input id="amount" name="amount" inputMode="decimal" required defaultValue={suggested > 0 ? toMajor(suggested) : ""} className={SMALL} />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="method">Paid by</FieldLabel>
        <select id="method" name="method" defaultValue="upi" className={SMALL}>
          <option value="upi">UPI</option>
          <option value="bank">Bank transfer</option>
          <option value="card">Card</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="paidAt">Received on</FieldLabel>
        <input id="paidAt" name="paidAt" type="date" defaultValue={today} className={SMALL} />
      </div>
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="reference">Reference</FieldLabel>
        <input id="reference" name="reference" placeholder="UTR / invoice no." className={SMALL} />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <FieldLabel htmlFor="pnote">Note</FieldLabel>
        <input id="pnote" name="note" className={SMALL} />
      </div>
      <label className="flex items-center gap-2.5 text-[13px] text-ink-plain sm:col-span-2">
        <input type="checkbox" name="advance" value="1" defaultChecked className="h-4 w-4 accent-[#aad0af]" />
        Mark them paid up and move the next due date on one billing period
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Save label="Record the payment" />
        <ErrorNote>{state.error}</ErrorNote>
        <DoneNote>{state.done}</DoneNote>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------- plans --- */

const FEATURES: { key: keyof PlanConfig["features"]; label: string }[] = [
  { key: "ordering", label: "Guests can order" },
  { key: "brandColours", label: "Own colours" },
  { key: "printStands", label: "Printable stands" },
  { key: "modelDownloads", label: "Model downloads" },
  { key: "removeCredit", label: "No Dish360 credit" },
];

const limit = (n: number | null) => (n === null ? "" : String(n));

export function PlansForm({ plans, currency }: { plans: PlanConfig[]; currency: string }) {
  const [state, action] = useFormState(updatePlansAction, EMPTY);
  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const id = (name: string) => `${plan.id}.${name}`;
          return (
            <fieldset key={plan.id} className="flex flex-col gap-3.5 rounded-2xl bg-white/[0.03] p-5 ring-1 ring-inset ring-white/[0.06]">
              <legend className="sr-only">{plan.name}</legend>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-dim">
                {plan.id === "free" ? "Entry plan" : plan.id === "pro" ? "Middle plan" : "Top plan"}
              </p>
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={id("name")}>Name</FieldLabel>
                <input id={id("name")} name={id("name")} defaultValue={plan.name} className={SMALL} />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={id("summary")}>One line</FieldLabel>
                <input id={id("summary")} name={id("summary")} defaultValue={plan.summary} className={SMALL} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={id("priceMonthly")}>{currency} / month</FieldLabel>
                  <input id={id("priceMonthly")} name={id("priceMonthly")} inputMode="decimal" defaultValue={toMajor(plan.priceMonthlyMinor)} className={SMALL} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={id("priceYearly")}>{currency} / year</FieldLabel>
                  <input id={id("priceYearly")} name={id("priceYearly")} inputMode="decimal" defaultValue={toMajor(plan.priceYearlyMinor)} className={SMALL} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={id("dishLimit")}>Dishes</FieldLabel>
                  <input id={id("dishLimit")} name={id("dishLimit")} inputMode="numeric" defaultValue={limit(plan.dishLimit)} placeholder="∞" className={SMALL} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={id("tableCodeLimit")}>Codes</FieldLabel>
                  <input id={id("tableCodeLimit")} name={id("tableCodeLimit")} inputMode="numeric" defaultValue={limit(plan.tableCodeLimit)} placeholder="∞" className={SMALL} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor={id("monthlyBuildLimit")}>3D/mo</FieldLabel>
                  <input id={id("monthlyBuildLimit")} name={id("monthlyBuildLimit")} inputMode="numeric" defaultValue={limit(plan.monthlyBuildLimit)} placeholder="∞" className={SMALL} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {FEATURES.map((f) => (
                  <label key={f.key} className="flex items-center gap-2.5 text-[13px] text-ink-plain">
                    <input type="checkbox" name={id(f.key)} defaultChecked={plan.features[f.key]} className="h-4 w-4 accent-[#aad0af]" />
                    {f.label}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={id("extras")} hint="one per line">
                  Extra lines on the card
                </FieldLabel>
                <textarea id={id("extras")} name={id("extras")} rows={3} defaultValue={plan.extras.join("\n")} className={SMALL} />
              </div>
            </fieldset>
          );
        })}
      </div>
      <p className="text-[12px] text-ink-dim">
        Leave a limit empty for unlimited. Prices apply to everyone on the list price;
        a restaurant with its own agreed price keeps it.
      </p>
      <div className="flex items-center gap-3">
        <Save label="Save the plans" />
        <ErrorNote>{state.error}</ErrorNote>
        <DoneNote>{state.done}</DoneNote>
      </div>
    </form>
  );
}

export function PlatformForm({ settings }: { settings: PlatformSettings }) {
  const [state, action] = useFormState(updatePlatformAction, EMPTY);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="apiCost">3D service, per model</FieldLabel>
        <input id="apiCost" name="apiCost" inputMode="decimal" defaultValue={toMajor(settings.apiCostPerBuildMinor)} className={SMALL} />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="apiCostCurrency">…in currency</FieldLabel>
        <input id="apiCostCurrency" name="apiCostCurrency" defaultValue={settings.apiCostCurrency} maxLength={3} className={cn(SMALL, "uppercase")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="currency">Restaurants billed in</FieldLabel>
        <input id="currency" name="currency" defaultValue={settings.currency} maxLength={3} className={cn(SMALL, "uppercase")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="trialDays">Trial length (days)</FieldLabel>
        <input id="trialDays" name="trialDays" inputMode="numeric" defaultValue={settings.trialDays} className={SMALL} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-4">
        <Save label="Save" />
        <ErrorNote>{state.error}</ErrorNote>
        <DoneNote>{state.done}</DoneNote>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------- inquiry --- */

export function LeadForm({ lead }: { lead: Lead }) {
  const [state, action] = useFormState(updateLeadAction, EMPTY);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="leadId" value={lead.id} />
      <div className="flex flex-wrap items-center gap-2">
        {(["new", "contacted", "won", "lost"] as const).map((s) => (
          <label
            key={s}
            className="cursor-pointer rounded-full bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold capitalize text-ink-plain has-[:checked]:bg-sage has-[:checked]:text-charcoal"
          >
            <input type="radio" name="status" value={s} defaultChecked={lead.status === s} className="sr-only" />
            {s}
          </label>
        ))}
      </div>
      <textarea
        name="notes"
        rows={2}
        defaultValue={lead.notes}
        placeholder="Your notes: called, demo booked, price agreed…"
        aria-label="Notes"
        className={SMALL}
      />
      <div className="flex items-center gap-3">
        <Save label="Save" size="sm" />
        <ErrorNote>{state.error}</ErrorNote>
        <DoneNote>{state.done}</DoneNote>
      </div>
    </form>
  );
}

/* ---------------------------------------------------------------- reset link --- */

export function ResetLinkButton({ userId }: { userId: string }) {
  const [state, action] = useFormState(sendResetLinkAction, EMPTY);
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <Save label="Make a password-reset link" size="sm" />
      </form>
      <ErrorNote>{state.error}</ErrorNote>
      {state.value ? (
        <div className="flex flex-col gap-1.5">
          <DoneNote>{state.done}</DoneNote>
          <div className="flex items-center gap-2">
            <input readOnly value={state.value} aria-label="Reset link" className={cn(SMALL, "font-mono text-[11.5px]")} onFocus={(e) => e.currentTarget.select()} />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(state.value ?? "");
                setCopied(true);
              }}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-ink-plain hover:bg-white/[0.1]"
              aria-label="Copy the link"
            >
              {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ delete --- */

export function DeleteRestaurantForm({ restaurantId, slug }: { restaurantId: string; slug: string }) {
  const [state, action] = useFormState(deleteRestaurantAction, EMPTY);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="restaurantId" value={restaurantId} />
      <p className="text-[12.5px] text-ink-dim">
        Deletes the restaurant, its accounts, menu, codes, orders, payments and history. It cannot be
        undone. Type <span className="font-mono text-ink-plain">{slug}</span> to confirm.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input name="confirm" aria-label={`Type ${slug} to confirm`} autoComplete="off" className={cn(SMALL, "max-w-56")} />
        <DangerSubmit />
      </div>
      <ErrorNote>{state.error}</ErrorNote>
    </form>
  );
}

function DangerSubmit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="danger" disabled={pending}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "Delete for good"}
    </Button>
  );
}
