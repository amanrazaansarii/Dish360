import type { Dish } from "./types";

/**
 * The rules about when a dish is visible, in one place.
 *
 * The landing page makes two promises that live here:
 *   "You check every dish and approve it before any guest sees it"
 *   "mark one as sold out … every table shows the change straight away"
 */

/** The owner has a model they could release, but has not released it yet. */
export function awaitingApproval(dish: Dish): boolean {
  return dish.model.status === "ready" && !dish.model.approved;
}

/** A guest can open this dish in AR right now. */
export function isLiveInAr(dish: Dish): boolean {
  return (
    dish.model.status === "ready" &&
    dish.model.approved &&
    Boolean(dish.model.glbUrl)
  );
}

/** A guest can see this dish on the menu at all. */
export function isOnMenu(dish: Dish): boolean {
  return dish.published;
}

/** Short, plain status for the owner's menu list. */
export function dishStatusLabel(dish: Dish): {
  label: string;
  tone: "live" | "waiting" | "off" | "draft";
} {
  if (!dish.published) return { label: "Not shown", tone: "draft" };
  if (dish.soldOut) return { label: "Sold out", tone: "off" };
  if (isLiveInAr(dish)) return { label: "Live in 3D", tone: "live" };
  if (awaitingApproval(dish)) return { label: "Waiting for you", tone: "waiting" };
  if (dish.model.status === "building") return { label: "Building", tone: "waiting" };
  if (dish.model.status === "failed") return { label: "Build failed", tone: "off" };
  return { label: "On the menu", tone: "live" };
}
