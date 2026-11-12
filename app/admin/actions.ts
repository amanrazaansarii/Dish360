"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createPayment,
  deleteLead,
  deletePayment,
  deleteRestaurant,
  findUserById,
  getRestaurant,
  listLeads,
  updateLead,
  updatePlatformSettings,
  updateRestaurant,
} from "@/lib/db";
import { requireAdmin } from "@/lib/auth/admin";
import { startActingAs, stopActing } from "@/lib/auth/session";
import { issueResetLink } from "@/lib/auth/reset";
import { settings } from "@/lib/platform";
import { PLAN_IDS, subscriptionPrice, planFrom } from "@/lib/plans";
import { parseMoney } from "@/lib/utils";
import type {
  BillingInterval,
  LeadStatus,
  PaymentMethod,
  PlanConfig,
  PlanId,
  SubscriptionStatus,
} from "@/lib/types";

/**
 * Everything the admin panel can change.
 *
 * Every action starts with requireAdmin(): Server Actions can be posted to by
 * anyone who has the page's action id, so the check is here and not only on
 * the pages.
 */

export interface AdminState {
  error?: string;
  done?: string;
  /** a value to hand back, such as a reset link to copy */
  value?: string;
}

const STATUSES: SubscriptionStatus[] = ["trial", "active", "past_due", "cancelled", "comped"];
const METHODS: PaymentMethod[] = ["upi", "bank", "card", "cash", "other"];
const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "won", "lost"];

function refreshRestaurant(id: string, slug?: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/restaurants/${id}`);
  revalidatePath("/dashboard", "layout");
  if (slug) revalidatePath(`/m/${slug}`);
}

/** "2026-11-12" from a date input, as an ISO instant at midday (no timezone surprises). */
function dateOrNull(value: FormDataEntryValue | null): string | null {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  return new Date(`${text}T12:00:00`).toISOString();
}

function addInterval(fromIso: string, interval: BillingInterval): string {
  const d = new Date(fromIso);
  if (interval === "year") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/* ----------------------------------------------------- working as owner --- */

export async function actAsAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  if (!(await getRestaurant(id))) return;
  await startActingAs(id);
  redirect("/dashboard");
}

export async function stopActingAction(): Promise<void> {
  await requireAdmin();
  stopActing();
  redirect("/admin/restaurants");
}

/* ------------------------------------------------------------ the place --- */

export async function setPlanAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const plan = String(formData.get("plan") ?? "") as PlanId;
  if (!PLAN_IDS.includes(plan)) return;
  const restaurant = await updateRestaurant(id, { plan });
  if (restaurant) refreshRestaurant(id, restaurant.slug);
}

export async function setSuspendedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const suspended = String(formData.get("suspended") ?? "") === "1";
  const restaurant = await updateRestaurant(id, { suspended });
  if (restaurant) refreshRestaurant(id, restaurant.slug);
}

export async function setPublishedAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const published = String(formData.get("published") ?? "") === "1";
  const restaurant = await updateRestaurant(id, { published });
  if (restaurant) refreshRestaurant(id, restaurant.slug);
}

export async function updateSubscriptionAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const restaurant = await getRestaurant(id);
  if (!restaurant) return { error: "That restaurant is not there any more." };

  const status = String(formData.get("status") ?? "") as SubscriptionStatus;
  const interval = String(formData.get("interval") ?? "") as BillingInterval;
  if (!STATUSES.includes(status)) return { error: "Pick a status." };
  if (interval !== "month" && interval !== "year") return { error: "Pick monthly or yearly." };

  const plan = String(formData.get("plan") ?? restaurant.plan) as PlanId;
  if (!PLAN_IDS.includes(plan)) return { error: "Pick a plan." };

  const priceText = String(formData.get("customPrice") ?? "").trim();
  const customPriceMinor = priceText === "" ? null : parseMoney(priceText);

  await updateRestaurant(id, {
    plan,
    subscription: {
      ...restaurant.subscription,
      status,
      interval,
      customPriceMinor,
      renewsAt: dateOrNull(formData.get("renewsAt")),
      trialEndsAt: status === "trial" ? dateOrNull(formData.get("renewsAt")) : null,
      note: String(formData.get("note") ?? "").slice(0, 500),
    },
  });
  refreshRestaurant(id, restaurant.slug);
  return { done: "Saved." };
}

/* ------------------------------------------------------------- payments --- */

export async function recordPaymentAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const restaurant = await getRestaurant(id);
  if (!restaurant) return { error: "That restaurant is not there any more." };

  const amountMinor = parseMoney(String(formData.get("amount") ?? ""));
  if (amountMinor <= 0) return { error: "Enter the amount received." };
  const method = String(formData.get("method") ?? "other") as PaymentMethod;
  if (!METHODS.includes(method)) return { error: "Pick how it was paid." };

  const platform = await settings();
  const paidAt = dateOrNull(formData.get("paidAt")) ?? new Date().toISOString();
  const sub = restaurant.subscription;

  // The period this pays for: from the current due date (or today), one
  // billing interval on.
  const periodStart = sub.renewsAt && Date.parse(sub.renewsAt) > Date.parse(paidAt) - 45 * 86400000
    ? sub.renewsAt
    : paidAt;
  const periodEnd = addInterval(periodStart, sub.interval);

  await createPayment({
    restaurantId: id,
    amountMinor,
    currency: platform.currency,
    method,
    reference: String(formData.get("reference") ?? "").slice(0, 120),
    note: String(formData.get("note") ?? "").slice(0, 500),
    periodStart,
    periodEnd,
    paidAt,
  });

  // Paying moves the next due date on, and brings a late or trial account
  // into good standing. A comped place stays comped.
  if (String(formData.get("advance") ?? "") === "1" && sub.status !== "comped") {
    await updateRestaurant(id, {
      subscription: { ...sub, status: "active", renewsAt: periodEnd, trialEndsAt: null },
    });
  }

  refreshRestaurant(id, restaurant.slug);
  revalidatePath("/admin/billing");
  return { done: "Payment recorded." };
}

export async function deletePaymentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("paymentId") ?? "");
  const restaurantId = String(formData.get("restaurantId") ?? "");
  await deletePayment(id);
  revalidatePath("/admin/billing");
  if (restaurantId) refreshRestaurant(restaurantId);
}

/* -------------------------------------------------------------- pricing --- */

const num = (value: FormDataEntryValue | null): number | null => {
  const text = String(value ?? "").trim();
  if (text === "" || /^unlimited$/i.test(text)) return null;
  const n = Math.floor(Number(text));
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export async function updatePlansAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const current = await settings();

  const plans: PlanConfig[] = PLAN_IDS.map((id) => {
    const was = planFrom(current.plans, id);
    const field = (name: string) => formData.get(`${id}.${name}`);
    const name = String(field("name") ?? "").trim() || was.name;
    return {
      ...was,
      name: name.slice(0, 40),
      summary: String(field("summary") ?? was.summary).trim().slice(0, 200),
      priceMonthlyMinor: parseMoney(String(field("priceMonthly") ?? "0")),
      priceYearlyMinor: parseMoney(String(field("priceYearly") ?? "0")),
      dishLimit: num(field("dishLimit")),
      tableCodeLimit: num(field("tableCodeLimit")),
      monthlyBuildLimit: num(field("monthlyBuildLimit")),
      features: {
        ordering: field("ordering") === "on",
        brandColours: field("brandColours") === "on",
        modelDownloads: field("modelDownloads") === "on",
        printStands: field("printStands") === "on",
        removeCredit: field("removeCredit") === "on",
      },
      extras: String(field("extras") ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 8),
    };
  });

  await updatePlatformSettings({ plans });
  revalidatePath("/", "layout");
  return { done: "Plans saved. They apply from the next page anyone opens." };
}

const platformSchema = z.object({
  currency: z.string().trim().length(3).toUpperCase(),
  trialDays: z.coerce.number().int().min(0).max(90),
  apiCostCurrency: z.string().trim().length(3).toUpperCase(),
});

export async function updatePlatformAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = platformSchema.safeParse({
    currency: formData.get("currency"),
    trialDays: formData.get("trialDays"),
    apiCostCurrency: formData.get("apiCostCurrency"),
  });
  if (!parsed.success) return { error: "Check the currencies (three letters, like INR) and the trial days." };

  await updatePlatformSettings({
    ...parsed.data,
    apiCostPerBuildMinor: parseMoney(String(formData.get("apiCost") ?? "0")),
  });
  revalidatePath("/admin", "layout");
  return { done: "Saved." };
}

/* ------------------------------------------------------------ inquiries --- */

export async function updateLeadAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) return { error: "Pick a status." };
  await updateLead(id, { status, notes: String(formData.get("notes") ?? "").slice(0, 4000) });
  revalidatePath("/admin", "layout");
  return { done: "Saved." };
}

/** An owner asked to change plan: switch it, and close the inquiry as won. */
export async function applyRequestedPlanAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("leadId") ?? "");
  const lead = (await listLeads()).find((l) => l.id === id);
  if (!lead?.restaurantId || !lead.requestedPlan) return;

  const restaurant = await getRestaurant(lead.restaurantId);
  if (!restaurant) return;

  const plan = planFrom((await settings()).plans, lead.requestedPlan);
  const free = subscriptionPrice(plan, { ...restaurant.subscription, customPriceMinor: null }) === 0;
  await updateRestaurant(restaurant.id, {
    plan: lead.requestedPlan,
    subscription: {
      ...restaurant.subscription,
      // A paid plan is due from today; the first payment recorded moves it on.
      status: free ? "active" : restaurant.subscription.status === "comped" ? "comped" : "active",
      customPriceMinor: null,
      renewsAt: free ? null : new Date().toISOString(),
    },
  });
  await updateLead(id, { status: "won" });
  refreshRestaurant(restaurant.id, restaurant.slug);
}

/* ---------------------------------------------------------------- people --- */

export async function sendResetLinkAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const user = await findUserById(String(formData.get("userId") ?? ""));
  if (!user) return { error: "That account is not there any more." };
  const link = await issueResetLink(user, "admin");
  revalidatePath("/admin/outbox");
  return { done: "Link made. It works once, for an hour.", value: link };
}

/* ------------------------------------------------------------- removing --- */

/**
 * Deletes a restaurant for good. The form asks for the restaurant's web
 * address to be typed out, so it cannot happen by a stray click, and the
 * admin's own demo café cannot be deleted from here.
 */
export async function deleteRestaurantAction(
  _previous: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const { user } = await requireAdmin();
  const id = String(formData.get("restaurantId") ?? "");
  const restaurant = await getRestaurant(id);
  if (!restaurant) return { error: "That restaurant is not there any more." };
  if (restaurant.id === user.restaurantId) return { error: "This is your own demo café; it stays." };
  if (String(formData.get("confirm") ?? "").trim() !== restaurant.slug) {
    return { error: `Type ${restaurant.slug} to confirm.` };
  }
  await deleteRestaurant(id);
  revalidatePath("/admin", "layout");
  redirect("/admin/restaurants");
}

export async function deleteLeadAction(formData: FormData): Promise<void> {
  await requireAdmin();
  await deleteLead(String(formData.get("leadId") ?? ""));
  revalidatePath("/admin", "layout");
}
