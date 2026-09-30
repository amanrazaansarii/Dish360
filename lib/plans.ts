import type { PlanId } from "@/lib/types";

/**
 * What each plan allows.
 *
 * Deliberately no prices here. The live home page carries no price list — it
 * ends at "Book a demo" — so the dashboard shows an owner what their plan
 * allows and points them at a conversation, rather than inventing numbers the
 * site never promised. Names match the tiers in `components/PricingSection.tsx`.
 *
 * Limits are enforced server-side, in the actions that create dishes and table
 * codes, so a plan is a real boundary rather than a label.
 */

export interface Plan {
  id: PlanId;
  name: string;
  summary: string;
  dishLimit: number | null;
  tableCodeLimit: number | null;
  allows: string[];
  /** a small "Menu by Dish360" line at the foot of the guest menu */
  showsDish360Credit: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Starter",
    summary: "Enough to put a few dishes on the table and see what happens.",
    dishLimit: 8,
    tableCodeLimit: 4,
    allows: [
      "8 dishes",
      "4 table codes",
      "Your menu on the web",
      "3D on iPhone and Android",
      "Scan and view counts",
    ],
    showsDish360Credit: true,
  },
  {
    id: "pro",
    name: "Restaurant Pro",
    summary: "The whole menu, every table, and the numbers behind them.",
    dishLimit: 150,
    tableCodeLimit: 80,
    allows: [
      "150 dishes",
      "80 table codes",
      "Your own colours on the menu",
      "Which table looked at what",
      "Printable table stands",
      "Guests can order from the dish",
      "Download your 3D models",
      "No Dish360 credit line",
    ],
    showsDish360Credit: false,
  },
  {
    id: "enterprise",
    name: "Enterprise Group",
    summary: "More than one room, more than one menu.",
    dishLimit: null,
    tableCodeLimit: null,
    allows: [
      "Unlimited dishes and codes",
      "Several venues",
      "Staff accounts",
      "Your own web address",
      "Priority on model building",
    ],
    showsDish360Credit: false,
  },
];

export function getPlan(id: PlanId): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}

/** `null` when there is room, otherwise the sentence to show the owner. */
export function dishLimitReached(plan: PlanId, count: number): string | null {
  const limit = getPlan(plan).dishLimit;
  if (limit === null || count < limit) return null;
  return `Your ${getPlan(plan).name} plan covers ${limit} dishes. Talk to us to add more.`;
}

export function tableCodeLimitReached(plan: PlanId, count: number): string | null {
  const limit = getPlan(plan).tableCodeLimit;
  if (limit === null || count < limit) return null;
  return `Your ${getPlan(plan).name} plan covers ${limit} table codes. Talk to us to add more.`;
}
