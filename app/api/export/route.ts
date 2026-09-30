import { getAuth } from "@/lib/auth/session";
import {
  listCategories,
  listDishes,
  listEvents,
  listOrders,
  listTableCodes,
} from "@/lib/db";

/**
 * Everything the owner put in, back out again as one file.
 *
 * There is no lock-in here: menu, codes, orders and the numbers behind them all
 * download whenever they want, on any plan. 3D models download from each dish.
 */
export async function GET() {
  const auth = await getAuth();
  if (!auth) return Response.json({ error: "Please sign in again." }, { status: 401 });

  const { restaurant } = auth;

  const [categories, dishes, tableCodes, orders, events] = await Promise.all([
    listCategories(restaurant.id),
    listDishes(restaurant.id),
    listTableCodes(restaurant.id),
    listOrders(restaurant.id),
    listEvents(restaurant.id),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    schema: "dish360/v1",
    restaurant,
    categories,
    dishes,
    tableCodes,
    orders,
    events,
  };

  const filename = `dish360-${restaurant.slug}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
