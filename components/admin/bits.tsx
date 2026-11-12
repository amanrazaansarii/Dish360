import Link from "next/link";
import type { ReactNode } from "react";
import { Tag } from "@/components/app/ui";
import { cn, formatMoney } from "@/lib/utils";
import type { LeadSource, LeadStatus, Restaurant, SubscriptionStatus } from "@/lib/types";
import type { MonthBucket } from "@/lib/admin/metrics";

/** Small pieces the admin pages share. Server components: no interactivity. */

export function Kpi({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "warn";
}) {
  const body = (
    <div
      className={cn(
        "h-full rounded-2xl bg-surface-elevated px-5 py-4 shadow-glass ring-1 ring-inset ring-white/[0.07]",
        href && "transition-colors hover:bg-white/[0.06]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">{label}</p>
      <p className={cn("mt-1.5 text-[26px] font-bold leading-none", tone === "warn" ? "text-amber-200" : "text-ink")}>
        {value}
      </p>
      {hint ? <p className="mt-2 text-[11.5px] text-ink-dim">{hint}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Six months as columns. Values are whatever unit `format` speaks. */
export function MonthBars({
  months,
  format,
  empty = "Nothing yet",
}: {
  months: MonthBucket[];
  format: (value: number) => string;
  empty?: string;
}) {
  const max = Math.max(...months.map((m) => m.value), 0);
  if (max === 0) return <p className="py-8 text-center text-[13px] text-ink-dim">{empty}</p>;
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={months.map((m) => `${m.label}: ${format(m.value)}`).join(", ")}>
      {months.map((m, i) => (
        <div key={m.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
          <span className="truncate text-[10.5px] font-semibold text-ink-plain">{m.value > 0 ? format(m.value) : ""}</span>
          <div
            className={cn("w-full max-w-12 rounded-t-md", i === months.length - 1 ? "bg-sage" : "bg-sage/40")}
            style={{ height: `${Math.max(2, (m.value / max) * 100)}%` }}
          />
          <span className="text-[11px] text-ink-dim">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

const SUB_TONE: Record<SubscriptionStatus, "neutral" | "sage" | "amber" | "danger"> = {
  trial: "amber",
  active: "sage",
  past_due: "danger",
  cancelled: "neutral",
  comped: "neutral",
};
export const SUB_WORDS: Record<SubscriptionStatus, string> = {
  trial: "Trial",
  active: "Active",
  past_due: "Late",
  cancelled: "Cancelled",
  comped: "On the house",
};

export function SubTag({ status }: { status: SubscriptionStatus }) {
  return <Tag tone={SUB_TONE[status]}>{SUB_WORDS[status]}</Tag>;
}

export function LiveTag({ restaurant }: { restaurant: Restaurant }) {
  if (restaurant.suspended) return <Tag tone="danger">Suspended</Tag>;
  return restaurant.published ? <Tag>Live</Tag> : <Tag tone="amber">Not published</Tag>;
}

const LEAD_TONE: Record<LeadStatus, "neutral" | "sage" | "amber" | "danger"> = {
  new: "amber",
  contacted: "neutral",
  won: "sage",
  lost: "danger",
};
export function LeadTag({ status }: { status: LeadStatus }) {
  return <Tag tone={LEAD_TONE[status]}><span className="capitalize">{status}</span></Tag>;
}
export const SOURCE_WORDS: Record<LeadSource, string> = {
  demo: "Demo request",
  contact: "Contact form",
  upgrade: "Plan change",
};

export function money(minor: number, currency: string): string {
  return formatMoney(minor, currency);
}

export function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function PageHead({ title, lede, action }: { title: string; lede?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">Dish360 admin</p>
        <h1 className="mt-2 text-[clamp(1.7rem,3.5vw,2.3rem)] font-extrabold leading-[1.08] tracking-tight text-ink">{title}</h1>
        {lede ? <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-plain">{lede}</p> : null}
      </div>
      {action}
    </header>
  );
}

/** A table that scrolls sideways on a phone instead of squashing. */
export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-[13px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={h || i}
                scope="col"
                className={cn(
                  "border-b border-white/[0.06] px-3 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-dim",
                  i > 0 && "whitespace-nowrap",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr>td]:border-b [&>tr>td]:border-white/[0.04] [&>tr>td]:px-3 [&>tr>td]:py-3 [&>tr>td]:align-top">
          {children}
        </tbody>
      </table>
    </div>
  );
}
