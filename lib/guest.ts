import { getAuth } from "@/lib/auth/session";
import { planFor } from "@/lib/platform";
import type { PlanConfig, Restaurant } from "@/lib/types";

/**
 * Whether a guest-facing page may show this restaurant, and how.
 *
 * A menu reaches guests only when the owner has published it and Dish360 has
 * not suspended it. The owner (and Dish360's own admin) can still open it, to
 * check it before going live, and see a strip saying nobody else can.
 */

export const DEFAULT_BRAND = "#aad0af";

export type GuestAccess =
  | { ok: true; preview: null | "unpublished" | "suspended"; plan: PlanConfig; restaurant: Restaurant }
  | { ok: false; reason: "unpublished" | "suspended"; restaurant: Restaurant };

export async function guestAccess(restaurant: Restaurant): Promise<GuestAccess> {
  const plan = await planFor(restaurant.plan);
  // Own colours are a plan feature; without it the menu wears Dish360's.
  const shown: Restaurant = plan.features.brandColours
    ? restaurant
    : { ...restaurant, brandColor: DEFAULT_BRAND };

  const reason = restaurant.suspended ? "suspended" : !restaurant.published ? "unpublished" : null;
  if (!reason) return { ok: true, preview: null, plan, restaurant: shown };

  const auth = await getAuth();
  const insider =
    !!auth && (auth.admin || auth.user.restaurantId === restaurant.id || auth.restaurant.id === restaurant.id);
  if (insider) return { ok: true, preview: reason, plan, restaurant: shown };
  return { ok: false, reason, restaurant };
}

/** Whether guests can order right now: the plan allows it and the menu is live. */
export function canOrder(plan: PlanConfig, restaurant: Restaurant): boolean {
  return plan.features.ordering && restaurant.published && !restaurant.suspended;
}
