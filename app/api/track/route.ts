import { z } from "zod";
import { getDish, getRestaurantBySlug, recordEvent } from "@/lib/db";
import { deviceFromUserAgent } from "@/lib/utils";

/**
 * What guests did, sent from their phone.
 *
 * Guests never sign in, so this has to be open. It therefore accepts a fixed
 * set of event kinds only, and works out which restaurant each event belongs
 * to on the server rather than believing the request.
 */

const schema = z.object({
  kind: z.enum(["menu_view", "dish_view", "ar_open", "ar_close"]),
  slug: z.string().optional(),
  dishId: z.string().optional(),
  table: z.string().max(12).optional(),
  seconds: z.number().min(0).max(3600).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Bad event" }, { status: 400 });

  const { kind, slug, dishId, table, seconds } = parsed.data;

  let restaurantId: string | null = null;
  if (dishId) {
    const dish = await getDish(dishId);
    if (dish) restaurantId = dish.restaurantId;
  }
  if (!restaurantId && slug) {
    const restaurant = await getRestaurantBySlug(slug);
    if (restaurant) restaurantId = restaurant.id;
  }
  if (!restaurantId) return Response.json({ error: "Unknown menu" }, { status: 404 });

  await recordEvent({
    restaurantId,
    kind,
    dishId: dishId ?? null,
    seconds: seconds ?? null,
    device: deviceFromUserAgent(request.headers.get("user-agent")),
    tableNumber: table ?? null,
  });

  // Nothing reads the answer; 204 keeps sendBeacon quiet.
  return new Response(null, { status: 204 });
}
