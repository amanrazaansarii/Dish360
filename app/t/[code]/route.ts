import { redirect } from "next/navigation";
import {
  getDish,
  getRestaurant,
  getTableCodeByCode,
  recordEvent,
  recordScan,
} from "@/lib/db";
import { isLiveInAr } from "@/lib/dish";
import { deviceFromUserAgent } from "@/lib/utils";

/**
 * Step 4 of the home page: what the code on the table actually points at.
 *
 * "They point their phone camera at the code. The menu opens in the web
 * browser, no app to download."
 *
 * Records the scan, then forwards straight to the menu or to a single dish,
 * carrying the table number so everything that follows is counted against the
 * right table. A route handler rather than a page, so a guest never sees an
 * in-between screen flash past.
 */
export async function GET(
  request: Request,
  { params }: { params: { code: string } },
) {
  const row = await getTableCodeByCode(params.code);
  if (!row) redirect("/scan?unknown=1");
  if (!row.active) redirect("/scan?paused=1");

  const restaurant = await getRestaurant(row.restaurantId);
  if (!restaurant) redirect("/scan?unknown=1");

  await recordScan(row.id);
  await recordEvent({
    restaurantId: row.restaurantId,
    tableCodeId: row.id,
    kind: "scan",
    device: deviceFromUserAgent(request.headers.get("user-agent")),
    tableNumber: row.tableNumber,
  });

  const table = row.tableNumber ? `?table=${encodeURIComponent(row.tableNumber)}` : "";

  if (row.target === "dish" && row.targetDishId) {
    const dish = await getDish(row.targetDishId);
    // A code whose dish has gone still gets the guest to the menu, so the
    // printed stand on that table never becomes a dead end.
    if (dish && dish.published) {
      redirect(
        isLiveInAr(dish)
          ? `/view/${dish.id}${table}`
          : `/m/${restaurant.slug}/${dish.id}${table}`,
      );
    }
  }

  redirect(`/m/${restaurant.slug}${table}`);
}
