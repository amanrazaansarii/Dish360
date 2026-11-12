import { cache } from "react";
import { getPlatformSettings } from "@/lib/db";
import { planFrom } from "@/lib/plans";
import type { PlanConfig, PlanId, PlatformSettings } from "@/lib/types";

/**
 * The live plan prices and limits, as set in the admin panel.
 *
 * `cache` makes it one read per request however many components ask. Anything
 * that enforces a plan reads through here rather than the defaults in
 * `lib/plans.ts`, so a change in /admin/pricing applies on the next request.
 */
export const settings = cache(async (): Promise<PlatformSettings> => getPlatformSettings());

export async function planFor(id: PlanId): Promise<PlanConfig> {
  return planFrom((await settings()).plans, id);
}
