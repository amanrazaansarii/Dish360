import { fail, supabase } from "./client";
import {
  dishColumns,
  restaurantColumns,
  tableCodeColumns,
  toCategory,
  toDish,
  toEvent,
  toLead,
  toOrder,
  toOutbox,
  toRestaurant,
  toReview,
  toSession,
  toTableCode,
  toUser,
} from "./rows";
import type {
  AnalyticsEvent,
  Category,
  Dish,
  DishModel,
  EventKind,
  Lead,
  Order,
  OrderStatus,
  OutboxMessage,
  Restaurant,
  Review,
  Session,
  TableCode,
  User,
} from "@/lib/types";

/**
 * The Supabase backend.
 *
 * Exports exactly the same functions as `lib/db/local/repository.ts`, so
 * nothing above `lib/db` knows or cares which one is running.
 */

/* ------------------------------------------------------------------ users --- */

export async function findUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) fail("look up that email", error);
  return data ? toUser(data) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("look up that account", error);
  return data ? toUser(data) : null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  restaurantId: string;
  role?: User["role"];
}): Promise<User> {
  const { data, error } = await supabase()
    .from("users")
    .insert({
      email: input.email.trim().toLowerCase(),
      name: input.name,
      password_hash: input.passwordHash,
      restaurant_id: input.restaurantId,
      role: input.role ?? "owner",
    })
    .select()
    .single();
  if (error) fail("create that account", error);
  return toUser(data);
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "email" | "passwordHash">>,
): Promise<User | null> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email.trim().toLowerCase();
  if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
  if (Object.keys(row).length === 0) return findUserById(id);

  const { data, error } = await supabase()
    .from("users")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("save that account", error);
  return data ? toUser(data) : null;
}

/* --------------------------------------------------------------- sessions --- */

export async function createSession(userId: string, ttlDays = 30): Promise<Session> {
  const now = Date.now();

  // Clear out what has expired while we are here, so the table cannot grow
  // without bound. A failure is not worth stopping a sign-in for.
  await supabase()
    .from("sessions")
    .delete()
    .lt("expires_at", new Date(now).toISOString());

  const { data, error } = await supabase()
    .from("sessions")
    .insert({
      user_id: userId,
      expires_at: new Date(now + ttlDays * 86400000).toISOString(),
    })
    .select()
    .single();
  if (error) fail("start a session", error);
  return toSession(data);
}

export async function findSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase()
    .from("sessions")
    .select("*")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  // A malformed id is not a server problem — it reads as "not signed in".
  if (error) return null;
  return data ? toSession(data) : null;
}

export async function deleteSession(id: string): Promise<void> {
  await supabase().from("sessions").delete().eq("id", id);
}

/* ------------------------------------------------------------ restaurants --- */

export async function listRestaurants(options?: {
  publishedOnly?: boolean;
}): Promise<Restaurant[]> {
  let query = supabase().from("restaurants").select("*").order("name");
  if (options?.publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) fail("list the places", error);
  return (data ?? []).map(toRestaurant);
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase()
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("load that place", error);
  return data ? toRestaurant(data) : null;
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase()
    .from("restaurants")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) fail("load that menu", error);
  return data ? toRestaurant(data) : null;
}

export async function createRestaurant(
  input: Pick<Restaurant, "name" | "slug"> & Partial<Restaurant>,
): Promise<Restaurant> {
  const { data, error } = await supabase()
    .from("restaurants")
    .insert({
      name: input.name,
      slug: input.slug,
      tagline: input.tagline ?? "",
      about: input.about ?? "",
      cuisine: input.cuisine ?? [],
      city: input.city ?? "",
      address: input.address ?? "",
      phone: input.phone ?? "",
      website: input.website ?? "",
      logo_url: input.logoUrl ?? null,
      brand_color: input.brandColor ?? "#aad0af",
      currency: input.currency ?? "INR",
      plan: input.plan ?? "free",
      hours:
        input.hours ??
        [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          day,
          open: "09:00",
          close: "22:00",
          closed: false,
        })),
      published: input.published ?? false,
    })
    .select()
    .single();
  if (error) fail("create that place", error);
  return toRestaurant(data);
}

export async function updateRestaurant(
  id: string,
  patch: Partial<Restaurant>,
): Promise<Restaurant | null> {
  const row = restaurantColumns(patch);
  if (Object.keys(row).length === 0) return getRestaurant(id);

  const { data, error } = await supabase()
    .from("restaurants")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("save that place", error);
  return data ? toRestaurant(data) : null;
}

export async function slugAvailable(slug: string, exceptId?: string): Promise<boolean> {
  let query = supabase().from("restaurants").select("id").eq("slug", slug);
  if (exceptId) query = query.neq("id", exceptId);

  const { data, error } = await query.limit(1);
  if (error) fail("check that address", error);
  return (data ?? []).length === 0;
}

/* ------------------------------------------------------------- categories --- */

export async function listCategories(restaurantId: string): Promise<Category[]> {
  const { data, error } = await supabase()
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_index");
  if (error) fail("list the sections", error);
  return (data ?? []).map(toCategory);
}

export async function createCategory(input: {
  restaurantId: string;
  name: string;
  description?: string;
}): Promise<Category> {
  const siblings = await listCategories(input.restaurantId);

  const { data, error } = await supabase()
    .from("categories")
    .insert({
      restaurant_id: input.restaurantId,
      name: input.name,
      description: input.description ?? "",
      sort_index: siblings.length,
    })
    .select()
    .single();
  if (error) fail("add that section", error);
  return toCategory(data);
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "description" | "sortIndex">>,
): Promise<Category | null> {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.sortIndex !== undefined) row.sort_index = patch.sortIndex;
  if (Object.keys(row).length === 0) return null;

  const { data, error } = await supabase()
    .from("categories")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("rename that section", error);
  return data ? toCategory(data) : null;
}

export async function deleteCategory(id: string): Promise<void> {
  // Dishes survive: the column is ON DELETE SET NULL, so they fall back to
  // "Everything else" rather than disappearing with the heading.
  const { error } = await supabase().from("categories").delete().eq("id", id);
  if (error) fail("remove that section", error);
}

export async function reorderCategories(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, index) =>
      supabase().from("categories").update({ sort_index: index }).eq("id", id),
    ),
  );
}

/* ----------------------------------------------------------------- dishes --- */

export async function listDishes(
  restaurantId: string,
  options?: { publishedOnly?: boolean },
): Promise<Dish[]> {
  let query = supabase()
    .from("dishes")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("sort_index");
  if (options?.publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) fail("list the menu", error);
  return (data ?? []).map(toDish);
}

export async function getDish(id: string): Promise<Dish | null> {
  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  // An id that is not a uuid is a bad link, not a server fault.
  if (error) return null;
  return data ? toDish(data) : null;
}

export async function listFeaturedDishes(limit = 6): Promise<Dish[]> {
  const live = await listRestaurants({ publishedOnly: true });
  if (live.length === 0) return [];

  const { data, error } = await supabase()
    .from("dishes")
    .select("*")
    .in(
      "restaurant_id",
      live.map((r) => r.id),
    )
    .eq("published", true)
    .eq("featured", true)
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) fail("find the featured dishes", error);
  return (data ?? []).map(toDish);
}

export async function createDish(
  input: { restaurantId: string; name: string } & Partial<Dish>,
): Promise<Dish> {
  const siblings = await listDishes(input.restaurantId);

  const { data, error } = await supabase()
    .from("dishes")
    .insert({
      restaurant_id: input.restaurantId,
      category_id: input.categoryId ?? null,
      name: input.name,
      description: input.description ?? "",
      price_minor: input.priceMinor ?? 0,
      currency: input.currency ?? "INR",
      image_url: input.imageUrl ?? null,
      calories: input.calories ?? null,
      ingredients: input.ingredients ?? [],
      allergens: input.allergens ?? [],
      diet_tags: input.dietTags ?? [],
      spice_level: input.spiceLevel ?? 0,
      prep_minutes: input.prepMinutes ?? null,
      flavour: input.flavour ?? { savoury: 60, sweet: 40, tang: 40, heat: 10 },
      rating: input.rating ?? 0,
      rating_count: input.ratingCount ?? 0,
      sold_out: input.soldOut ?? false,
      featured: input.featured ?? false,
      published: input.published ?? false,
      sort_index: siblings.length,
      model: input.model ?? {
        status: "none",
        glbUrl: null,
        usdzUrl: null,
        provider: null,
        vertices: null,
        approved: false,
        approvedAt: null,
        scale: 1,
        exposure: 1,
        shadowIntensity: 1,
        shadowSoftness: 0.8,
        autoRotate: true,
        environment: "warm",
        error: null,
        updatedAt: null,
      },
    })
    .select()
    .single();
  if (error) fail("add that dish", error);
  return toDish(data);
}

export async function updateDish(id: string, patch: Partial<Dish>): Promise<Dish | null> {
  const row = dishColumns(patch);
  row.updated_at = new Date().toISOString();

  const { data, error } = await supabase()
    .from("dishes")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("save that dish", error);
  return data ? toDish(data) : null;
}

export async function updateDishModel(
  id: string,
  patch: Partial<DishModel>,
): Promise<Dish | null> {
  const dish = await getDish(id);
  if (!dish) return null;

  return updateDish(id, {
    model: { ...dish.model, ...patch, updatedAt: new Date().toISOString() },
  });
}

/** The owner releasing a model to guests, or taking it back off. */
export async function setModelApproved(
  id: string,
  approved: boolean,
): Promise<Dish | null> {
  const dish = await getDish(id);
  if (!dish) return null;

  return updateDish(id, {
    model: {
      ...dish.model,
      approved,
      approvedAt: approved ? new Date().toISOString() : null,
    },
  });
}

export async function deleteDish(id: string): Promise<void> {
  // A code pointing at this dish falls back to the whole menu, so the stand
  // already on that table keeps working. The FK is ON DELETE SET NULL, which
  // clears the id; this puts the target back to "menu" to match.
  await supabase()
    .from("table_codes")
    .update({ target: "menu", target_dish_id: null })
    .eq("target_dish_id", id);

  const { error } = await supabase().from("dishes").delete().eq("id", id);
  if (error) fail("remove that dish", error);
}

export async function reorderDishes(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id, index) =>
      supabase().from("dishes").update({ sort_index: index }).eq("id", id),
    ),
  );
}

/* ------------------------------------------------------------ table codes --- */

export async function listTableCodes(restaurantId: string): Promise<TableCode[]> {
  const { data, error } = await supabase()
    .from("table_codes")
    .select("*")
    .eq("restaurant_id", restaurantId);
  if (error) fail("list the table codes", error);

  // "Table 2" has to come before "Table 10", which is not what Postgres gives
  // for text, so the ordering happens here.
  return (data ?? [])
    .map(toTableCode)
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
}

export async function getTableCode(id: string): Promise<TableCode | null> {
  const { data, error } = await supabase()
    .from("table_codes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data ? toTableCode(data) : null;
}

export async function getTableCodeByCode(code: string): Promise<TableCode | null> {
  const { data, error } = await supabase()
    .from("table_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) return null;
  return data ? toTableCode(data) : null;
}

export async function createTableCode(input: {
  restaurantId: string;
  code: string;
  label: string;
  target: TableCode["target"];
  targetDishId?: string | null;
  tableNumber?: string | null;
}): Promise<TableCode> {
  const { data, error } = await supabase()
    .from("table_codes")
    .insert({
      restaurant_id: input.restaurantId,
      code: input.code.trim().toUpperCase(),
      label: input.label,
      target: input.target,
      target_dish_id: input.targetDishId ?? null,
      table_number: input.tableNumber ?? null,
    })
    .select()
    .single();
  if (error) fail("make that code", error);
  return toTableCode(data);
}

export async function updateTableCode(
  id: string,
  patch: Partial<Omit<TableCode, "id" | "code" | "restaurantId" | "createdAt">>,
): Promise<TableCode | null> {
  const row = tableCodeColumns(patch);
  if (Object.keys(row).length === 0) return getTableCode(id);

  const { data, error } = await supabase()
    .from("table_codes")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("save that code", error);
  return data ? toTableCode(data) : null;
}

export async function deleteTableCode(id: string): Promise<void> {
  const { error } = await supabase().from("table_codes").delete().eq("id", id);
  if (error) fail("delete that code", error);
}

export async function codeAvailable(code: string): Promise<boolean> {
  const { data, error } = await supabase()
    .from("table_codes")
    .select("id")
    .eq("code", code.trim().toUpperCase())
    .limit(1);
  if (error) fail("check that code", error);
  return (data ?? []).length === 0;
}

export async function recordScan(id: string): Promise<void> {
  // One statement in Postgres. Two guests scanning the same stand at the same
  // moment would otherwise lose a count to a read-modify-write.
  const { error } = await supabase().rpc("bump_scan", { code_id: id });
  if (error) {
    console.warn(`[dish360] could not count a scan on ${id}: ${error.message}`);
  }
}

/* -------------------------------------------------------------- analytics --- */

export async function recordEvent(input: {
  restaurantId: string;
  kind: EventKind;
  dishId?: string | null;
  tableCodeId?: string | null;
  seconds?: number | null;
  device?: AnalyticsEvent["device"];
  tableNumber?: string | null;
}): Promise<void> {
  const { error } = await supabase().from("events").insert({
    restaurant_id: input.restaurantId,
    dish_id: input.dishId ?? null,
    table_code_id: input.tableCodeId ?? null,
    kind: input.kind,
    seconds: input.seconds ?? null,
    device: input.device ?? "unknown",
    table_number: input.tableNumber ?? null,
  });
  // Losing one count must never break the page a guest is looking at.
  if (error) {
    console.warn(`[dish360] could not record a ${input.kind}: ${error.message}`);
  }
}

export async function listEvents(
  restaurantId: string,
  sinceDays?: number,
): Promise<AnalyticsEvent[]> {
  let query = supabase()
    .from("events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    // Postgrest caps a response anyway; this says so out loud. A busy café at
    // ~10 events a scan reaches this around 5,000 scans in the window.
    .limit(50000);

  if (sinceDays) {
    query = query.gte(
      "created_at",
      new Date(Date.now() - sinceDays * 86400000).toISOString(),
    );
  }

  const { data, error } = await query;
  if (error) fail("read the numbers", error);
  return (data ?? []).map(toEvent);
}

/* ----------------------------------------------------------------- orders --- */

export async function listOrders(
  restaurantId: string,
  status?: OrderStatus,
): Promise<Order[]> {
  let query = supabase()
    .from("orders")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) fail("list the orders", error);
  return (data ?? []).map(toOrder);
}

export async function createOrder(input: {
  restaurantId: string;
  tableNumber: string | null;
  items: Order["items"];
  currency: string;
  note?: string;
}): Promise<Order> {
  const { data, error } = await supabase()
    .from("orders")
    .insert({
      restaurant_id: input.restaurantId,
      table_number: input.tableNumber,
      items: input.items,
      total_minor: input.items.reduce(
        (sum, item) => sum + item.priceMinor * item.quantity,
        0,
      ),
      currency: input.currency,
      note: input.note ?? "",
      status: "new",
    })
    .select()
    .single();
  if (error) fail("send that order", error);
  return toOrder(data);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  const { data, error } = await supabase()
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) fail("update that order", error);
  return data ? toOrder(data) : null;
}

/* ---------------------------------------------------------------- reviews --- */

export async function listReviews(dishId: string): Promise<Review[]> {
  const { data, error } = await supabase()
    .from("reviews")
    .select("*")
    .eq("dish_id", dishId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(toReview);
}

export async function createReview(input: {
  restaurantId: string;
  dishId: string;
  rating: number;
  comment: string;
  author: string;
}): Promise<Review> {
  const { data, error } = await supabase()
    .from("reviews")
    .insert({
      restaurant_id: input.restaurantId,
      dish_id: input.dishId,
      rating: input.rating,
      comment: input.comment,
      author: input.author,
    })
    .select()
    .single();
  if (error) fail("save that review", error);

  // Keep the dish's own average in step with its reviews.
  const dish = await getDish(input.dishId);
  if (dish) {
    const total = dish.rating * dish.ratingCount + input.rating;
    const count = dish.ratingCount + 1;
    await updateDish(input.dishId, {
      ratingCount: count,
      rating: Math.round((total / count) * 10) / 10,
    });
  }

  return toReview(data);
}

/* ------------------------------------------------------------------ leads --- */

export async function createLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  const { data, error } = await supabase()
    .from("leads")
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone,
      restaurant_name: input.restaurantName,
      message: input.message,
    })
    .select()
    .single();
  if (error) fail("save that message", error);
  return toLead(data);
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("list the messages", error);
  return (data ?? []).map(toLead);
}

/* ----------------------------------------------------------------- outbox --- */

export async function queueMail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  const { error } = await supabase()
    .from("outbox")
    .insert({ to: input.to, subject: input.subject, body: input.body });
  if (error) {
    console.warn(`[dish360] could not record a message: ${error.message}`);
  }
}

/** Scoped by address: an unscoped outbox hands one owner everyone else's email. */
export async function listOutbox(to: string): Promise<OutboxMessage[]> {
  const { data, error } = await supabase()
    .from("outbox")
    .select("*")
    .eq("to", to.trim().toLowerCase())
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(toOutbox);
}
