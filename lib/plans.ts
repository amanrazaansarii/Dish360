import type { PlanConfig, PlanId, PlatformSettings, Subscription } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

/**
 * What each plan allows, and what it costs.
 *
 * These are only the starting values. The live ones are kept with the
 * platform settings and edited from the admin panel (/admin/pricing), so a
 * price or a limit changes without a deploy. Everything that enforces a plan
 * reads the live copy through `lib/platform.ts`.
 *
 * Limits are enforced server-side, in the actions that create dishes, table
 * codes and 3D builds, so a plan is a real boundary rather than a label.
 */

export const PLAN_IDS: PlanId[] = ["free", "pro", "enterprise"];

export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Starter",
    summary: "Enough to put a few dishes on the table and see what happens.",
    priceMonthlyMinor: 0,
    priceYearlyMinor: 0,
    dishLimit: 8,
    tableCodeLimit: 4,
    monthlyBuildLimit: 20,
    features: {
      ordering: false,
      brandColours: false,
      modelDownloads: false,
      printStands: true,
      removeCredit: false,
    },
    extras: ["Your menu on the web", "3D on iPhone and Android", "Scan and view counts"],
  },
  {
    id: "pro",
    name: "Restaurant Pro",
    summary: "The whole menu, every table, and the numbers behind them.",
    priceMonthlyMinor: 249900,
    priceYearlyMinor: 2499000,
    dishLimit: 150,
    tableCodeLimit: 80,
    monthlyBuildLimit: 300,
    features: {
      ordering: true,
      brandColours: true,
      modelDownloads: true,
      printStands: true,
      removeCredit: true,
    },
    extras: ["Which table looked at what"],
  },
  {
    id: "enterprise",
    name: "Enterprise Group",
    summary: "More than one room, more than one menu.",
    priceMonthlyMinor: 799900,
    priceYearlyMinor: 7999000,
    dishLimit: null,
    tableCodeLimit: null,
    monthlyBuildLimit: null,
    features: {
      ordering: true,
      brandColours: true,
      modelDownloads: true,
      printStands: true,
      removeCredit: true,
    },
    extras: ["Several venues", "Staff accounts", "Your own web address", "Priority on model building"],
  },
];

export function defaultSettings(): PlatformSettings {
  return {
    currency: "INR",
    plans: structuredClone(DEFAULT_PLANS),
    // Unknown until the 3D AI Studio account exists: set it in /admin/pricing.
    apiCostPerBuildMinor: 0,
    apiCostCurrency: "USD",
    trialDays: 14,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fills in anything a stored copy is missing, so settings saved by an older
 * version (or edited by hand) never leave a plan without a field.
 */
export function normaliseSettings(stored: Partial<PlatformSettings> | null | undefined): PlatformSettings {
  const base = defaultSettings();
  if (!stored) return base;
  const plans = PLAN_IDS.map((id) => {
    const fallback = base.plans.find((p) => p.id === id)!;
    const saved = stored.plans?.find((p) => p.id === id);
    if (!saved) return fallback;
    return {
      ...fallback,
      ...saved,
      features: { ...fallback.features, ...(saved.features ?? {}) },
      extras: Array.isArray(saved.extras) ? saved.extras : fallback.extras,
    };
  });
  return {
    ...base,
    ...stored,
    plans,
  };
}

export function planFrom(plans: PlanConfig[], id: PlanId): PlanConfig {
  return plans.find((plan) => plan.id === id) ?? plans[0] ?? DEFAULT_PLANS[0];
}

/** The plan card's lines: limits first, then what it switches on. */
export function planLines(plan: PlanConfig): string[] {
  const count = (n: number | null, one: string, many: string) =>
    n === null ? `Unlimited ${many}` : `${n} ${n === 1 ? one : many}`;
  const lines = [
    count(plan.dishLimit, "dish", "dishes"),
    count(plan.tableCodeLimit, "table code", "table codes"),
    plan.monthlyBuildLimit === null
      ? "Unlimited 3D builds"
      : `${plan.monthlyBuildLimit} 3D builds a month`,
  ];
  if (plan.features.ordering) lines.push("Guests can order from the dish");
  if (plan.features.brandColours) lines.push("Your own colours on the menu");
  if (plan.features.printStands) lines.push("Printable table stands");
  if (plan.features.modelDownloads) lines.push("Download your 3D models");
  if (plan.features.removeCredit) lines.push("No Dish360 credit line");
  return [...lines, ...plan.extras];
}

export function priceLabel(plan: PlanConfig, currency: string, interval: "month" | "year" = "month"): string {
  const minor = interval === "year" ? plan.priceYearlyMinor : plan.priceMonthlyMinor;
  if (minor === 0) return "Free";
  return `${formatMoney(minor, currency)} / ${interval}`;
}

/** `null` when there is room, otherwise the sentence to show the owner. */
export function dishLimitReached(plan: PlanConfig, count: number): string | null {
  const limit = plan.dishLimit;
  if (limit === null || count < limit) return null;
  return `Your ${plan.name} plan covers ${limit} dishes. Ask us to move you up a plan to add more.`;
}

export function tableCodeLimitReached(plan: PlanConfig, count: number): string | null {
  const limit = plan.tableCodeLimit;
  if (limit === null || count < limit) return null;
  return `Your ${plan.name} plan covers ${limit} table codes. Ask us to move you up a plan to add more.`;
}

export function buildLimitReached(plan: PlanConfig, buildsThisMonth: number): string | null {
  const limit = plan.monthlyBuildLimit;
  if (limit === null || buildsThisMonth < limit) return null;
  return `Your ${plan.name} plan covers ${limit} 3D builds a month, and this month's are used. They reset on the 1st.`;
}

/**
 * A subscription as it starts. New sign-ups begin on a trial of the plan they
 * are given; anything missing on an older record reads as a free place that
 * owes nothing.
 */
export function startingSubscription(options?: {
  status?: Subscription["status"];
  trialDays?: number;
  now?: Date;
}): Subscription {
  const now = options?.now ?? new Date();
  const status = options?.status ?? "active";
  const trialEnds =
    status === "trial" ? new Date(now.getTime() + (options?.trialDays ?? 14) * 86400000) : null;
  return {
    status,
    interval: "month",
    customPriceMinor: null,
    startedAt: now.toISOString(),
    renewsAt: trialEnds ? trialEnds.toISOString() : null,
    trialEndsAt: trialEnds ? trialEnds.toISOString() : null,
    note: "",
  };
}

export function normaliseSubscription(value: Partial<Subscription> | null | undefined, createdAt: string): Subscription {
  return {
    ...startingSubscription({ now: new Date(createdAt) }),
    ...(value ?? {}),
  };
}

/** What this place pays per billing period, in the billing currency's minor unit. */
export function subscriptionPrice(plan: PlanConfig, subscription: Subscription): number {
  if (subscription.customPriceMinor !== null) return subscription.customPriceMinor;
  return subscription.interval === "year" ? plan.priceYearlyMinor : plan.priceMonthlyMinor;
}

/** The same, spread over a month — what monthly recurring revenue adds up. */
export function monthlyValue(plan: PlanConfig, subscription: Subscription): number {
  if (subscription.status !== "active" && subscription.status !== "past_due") return 0;
  const price = subscriptionPrice(plan, subscription);
  return subscription.interval === "year" ? Math.round(price / 12) : price;
}
