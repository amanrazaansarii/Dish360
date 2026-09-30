import { z } from "zod";
import { createOrder, getDish, getRestaurantBySlug, recordEvent } from "@/lib/db";
import { deviceFromUserAgent } from "@/lib/utils";

/**
 * A guest ordering the dish they are looking at.
 *
 * Guests are anonymous, so nothing here is taken from the request beyond the
 * dish ids and how many: names, prices and the restaurant are all read back
 * from the store. That is what stops a crafted request ordering a ₹450 burger
 * at ₹1.
 */

const schema = z.object({
  slug: z.string().min(1),
  table: z.string().max(12).optional(),
  note: z.string().max(400).optional(),
  items: z
    .array(
      z.object({
        dishId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "That order could not be read." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "That order could not be read." }, { status: 400 });
  }

  const restaurant = await getRestaurantBySlug(parsed.data.slug);
  if (!restaurant) return Response.json({ error: "Unknown menu." }, { status: 404 });

  const items = [];
  let currency = restaurant.currency;

  for (const line of parsed.data.items) {
    const dish = await getDish(line.dishId);
    if (!dish || dish.restaurantId !== restaurant.id || !dish.published) {
      return Response.json(
        { error: "One of those is not on this menu." },
        { status: 400 },
      );
    }
    if (dish.soldOut) {
      return Response.json(
        { error: `${dish.name} has sold out.` },
        { status: 409 },
      );
    }
    // Name and price come from the record, never from the request.
    currency = dish.currency;
    items.push({
      dishId: dish.id,
      name: dish.name,
      priceMinor: dish.priceMinor,
      quantity: line.quantity,
    });
  }

  const order = await createOrder({
    restaurantId: restaurant.id,
    tableNumber: parsed.data.table ?? null,
    items,
    currency,
    note: parsed.data.note ?? "",
  });

  const device = deviceFromUserAgent(request.headers.get("user-agent"));
  for (const item of items) {
    await recordEvent({
      restaurantId: restaurant.id,
      dishId: item.dishId,
      kind: "order",
      device,
      tableNumber: parsed.data.table ?? null,
    });
  }

  return Response.json(
    {
      id: order.id,
      totalMinor: order.totalMinor,
      currency: order.currency,
      table: order.tableNumber,
    },
    { status: 201 },
  );
}
