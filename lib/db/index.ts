import { randomUUID } from "node:crypto";
import { read, write } from "./store";
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
 * The only way the app reaches data.
 *
 * Every function is async and returns plain objects, so replacing the local
 * JSON store with Supabase means rewriting the bodies in this one file and
 * nothing else.
 */

const clone = <T,>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

/* ------------------------------------------------------------------ users --- */

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await read();
  const wanted = email.trim().toLowerCase();
  return clone(db.users.find((u) => u.email.toLowerCase() === wanted) ?? null);
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await read();
  return clone(db.users.find((u) => u.id === id) ?? null);
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  restaurantId: string;
  role?: User["role"];
}): Promise<User> {
  return write((db) => {
    const user: User = {
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      name: input.name,
      passwordHash: input.passwordHash,
      restaurantId: input.restaurantId,
      role: input.role ?? "owner",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return clone(user);
  });
}

export async function updateUser(
  id: string,
  patch: Partial<Pick<User, "name" | "email" | "passwordHash">>,
): Promise<User | null> {
  return write((db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.email !== undefined) user.email = patch.email.trim().toLowerCase();
    if (patch.passwordHash !== undefined) user.passwordHash = patch.passwordHash;
    return clone(user);
  });
}

/* --------------------------------------------------------------- sessions --- */

export async function createSession(userId: string, ttlDays = 30): Promise<Session> {
  return write((db) => {
    const now = Date.now();
    // Sweep expired rows while we are here, so the file cannot grow forever.
    db.sessions = db.sessions.filter((s) => Date.parse(s.expiresAt) > now);
    const session: Session = {
      id: randomUUID(),
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlDays * 86400000).toISOString(),
    };
    db.sessions.push(session);
    return clone(session);
  });
}

export async function findSession(id: string): Promise<Session | null> {
  const db = await read();
  const session = db.sessions.find((s) => s.id === id);
  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;
  return clone(session);
}

export async function deleteSession(id: string): Promise<void> {
  await write((db) => {
    db.sessions = db.sessions.filter((s) => s.id !== id);
  });
}

/* ------------------------------------------------------------ restaurants --- */

export async function listRestaurants(options?: {
  publishedOnly?: boolean;
}): Promise<Restaurant[]> {
  const db = await read();
  const rows = options?.publishedOnly
    ? db.restaurants.filter((r) => r.published)
    : db.restaurants;
  return clone(rows).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const db = await read();
  return clone(db.restaurants.find((r) => r.id === id) ?? null);
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const db = await read();
  return clone(db.restaurants.find((r) => r.slug === slug) ?? null);
}

export async function createRestaurant(
  input: Pick<Restaurant, "name" | "slug"> & Partial<Restaurant>,
): Promise<Restaurant> {
  return write((db) => {
    const restaurant: Restaurant = {
      id: randomUUID(),
      slug: input.slug,
      name: input.name,
      tagline: input.tagline ?? "",
      about: input.about ?? "",
      cuisine: input.cuisine ?? [],
      city: input.city ?? "",
      address: input.address ?? "",
      phone: input.phone ?? "",
      website: input.website ?? "",
      logoUrl: input.logoUrl ?? null,
      brandColor: input.brandColor ?? "#aad0af",
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
      createdAt: new Date().toISOString(),
    };
    db.restaurants.push(restaurant);
    return clone(restaurant);
  });
}

export async function updateRestaurant(
  id: string,
  patch: Partial<Restaurant>,
): Promise<Restaurant | null> {
  return write((db) => {
    const restaurant = db.restaurants.find((r) => r.id === id);
    if (!restaurant) return null;
    Object.assign(restaurant, patch, {
      id: restaurant.id,
      createdAt: restaurant.createdAt,
    });
    return clone(restaurant);
  });
}

export async function slugAvailable(slug: string, exceptId?: string): Promise<boolean> {
  const db = await read();
  return !db.restaurants.some((r) => r.slug === slug && r.id !== exceptId);
}

/* ------------------------------------------------------------- categories --- */

export async function listCategories(restaurantId: string): Promise<Category[]> {
  const db = await read();
  return clone(db.categories.filter((c) => c.restaurantId === restaurantId)).sort(
    (a, b) => a.sortIndex - b.sortIndex,
  );
}

export async function createCategory(input: {
  restaurantId: string;
  name: string;
  description?: string;
}): Promise<Category> {
  return write((db) => {
    const siblings = db.categories.filter((c) => c.restaurantId === input.restaurantId);
    const category: Category = {
      id: randomUUID(),
      restaurantId: input.restaurantId,
      name: input.name,
      description: input.description ?? "",
      sortIndex: siblings.length,
    };
    db.categories.push(category);
    return clone(category);
  });
}

export async function updateCategory(
  id: string,
  patch: Partial<Pick<Category, "name" | "description" | "sortIndex">>,
): Promise<Category | null> {
  return write((db) => {
    const category = db.categories.find((c) => c.id === id);
    if (!category) return null;
    Object.assign(category, patch);
    return clone(category);
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await write((db) => {
    db.categories = db.categories.filter((c) => c.id !== id);
    // Dishes survive; they simply stop belonging to a section.
    for (const dish of db.dishes) {
      if (dish.categoryId === id) dish.categoryId = null;
    }
  });
}

export async function reorderCategories(ids: string[]): Promise<void> {
  await write((db) => {
    ids.forEach((id, index) => {
      const category = db.categories.find((c) => c.id === id);
      if (category) category.sortIndex = index;
    });
  });
}

/* ----------------------------------------------------------------- dishes --- */

export async function listDishes(
  restaurantId: string,
  options?: { publishedOnly?: boolean },
): Promise<Dish[]> {
  const db = await read();
  let rows = db.dishes.filter((d) => d.restaurantId === restaurantId);
  if (options?.publishedOnly) rows = rows.filter((d) => d.published);
  return clone(rows).sort((a, b) => a.sortIndex - b.sortIndex);
}

export async function getDish(id: string): Promise<Dish | null> {
  const db = await read();
  return clone(db.dishes.find((d) => d.id === id) ?? null);
}

export async function listFeaturedDishes(limit = 6): Promise<Dish[]> {
  const db = await read();
  const live = new Set(db.restaurants.filter((r) => r.published).map((r) => r.id));
  return clone(
    db.dishes
      .filter((d) => d.published && d.featured && live.has(d.restaurantId))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit),
  );
}

export async function createDish(
  input: { restaurantId: string; name: string } & Partial<Dish>,
): Promise<Dish> {
  return write((db) => {
    const siblings = db.dishes.filter((d) => d.restaurantId === input.restaurantId);
    const now = new Date().toISOString();
    const dish: Dish = {
      id: randomUUID(),
      restaurantId: input.restaurantId,
      categoryId: input.categoryId ?? null,
      name: input.name,
      description: input.description ?? "",
      priceMinor: input.priceMinor ?? 0,
      currency: input.currency ?? "INR",
      imageUrl: input.imageUrl ?? null,
      calories: input.calories ?? null,
      ingredients: input.ingredients ?? [],
      allergens: input.allergens ?? [],
      dietTags: input.dietTags ?? [],
      spiceLevel: input.spiceLevel ?? 0,
      prepMinutes: input.prepMinutes ?? null,
      flavour: input.flavour ?? { savoury: 60, sweet: 40, tang: 40, heat: 10 },
      rating: input.rating ?? 0,
      ratingCount: input.ratingCount ?? 0,
      soldOut: input.soldOut ?? false,
      featured: input.featured ?? false,
      published: input.published ?? false,
      sortIndex: siblings.length,
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
      createdAt: now,
      updatedAt: now,
    };
    db.dishes.push(dish);
    return clone(dish);
  });
}

export async function updateDish(id: string, patch: Partial<Dish>): Promise<Dish | null> {
  return write((db) => {
    const dish = db.dishes.find((d) => d.id === id);
    if (!dish) return null;
    Object.assign(dish, patch);
    dish.id = id;
    dish.updatedAt = new Date().toISOString();
    return clone(dish);
  });
}

export async function updateDishModel(
  id: string,
  patch: Partial<DishModel>,
): Promise<Dish | null> {
  return write((db) => {
    const dish = db.dishes.find((d) => d.id === id);
    if (!dish) return null;
    dish.model = { ...dish.model, ...patch, updatedAt: new Date().toISOString() };
    dish.updatedAt = new Date().toISOString();
    return clone(dish);
  });
}

/**
 * The owner releases a model to guests.
 *
 * This is the gate the landing page promises: a model exists from the moment it
 * is built, but no guest sees it in 3D until this has been called.
 */
export async function setModelApproved(
  id: string,
  approved: boolean,
): Promise<Dish | null> {
  return write((db) => {
    const dish = db.dishes.find((d) => d.id === id);
    if (!dish) return null;
    dish.model.approved = approved;
    dish.model.approvedAt = approved ? new Date().toISOString() : null;
    dish.updatedAt = new Date().toISOString();
    return clone(dish);
  });
}

export async function deleteDish(id: string): Promise<void> {
  await write((db) => {
    db.dishes = db.dishes.filter((d) => d.id !== id);
    // A code pointing at a deleted dish falls back to the whole menu, so the
    // printed stand on that table still works.
    for (const code of db.tableCodes) {
      if (code.targetDishId === id) {
        code.targetDishId = null;
        code.target = "menu";
      }
    }
  });
}

export async function reorderDishes(ids: string[]): Promise<void> {
  await write((db) => {
    ids.forEach((id, index) => {
      const dish = db.dishes.find((d) => d.id === id);
      if (dish) dish.sortIndex = index;
    });
  });
}

/* ------------------------------------------------------------ table codes --- */

export async function listTableCodes(restaurantId: string): Promise<TableCode[]> {
  const db = await read();
  return clone(db.tableCodes.filter((c) => c.restaurantId === restaurantId)).sort(
    (a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
}

export async function getTableCode(id: string): Promise<TableCode | null> {
  const db = await read();
  return clone(db.tableCodes.find((c) => c.id === id) ?? null);
}

export async function getTableCodeByCode(code: string): Promise<TableCode | null> {
  const db = await read();
  const wanted = code.trim().toUpperCase();
  return clone(db.tableCodes.find((c) => c.code.toUpperCase() === wanted) ?? null);
}

export async function createTableCode(input: {
  restaurantId: string;
  code: string;
  label: string;
  target: TableCode["target"];
  targetDishId?: string | null;
  tableNumber?: string | null;
}): Promise<TableCode> {
  return write((db) => {
    const row: TableCode = {
      id: randomUUID(),
      restaurantId: input.restaurantId,
      code: input.code.trim().toUpperCase(),
      label: input.label,
      target: input.target,
      targetDishId: input.targetDishId ?? null,
      tableNumber: input.tableNumber ?? null,
      scans: 0,
      lastScanAt: null,
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.tableCodes.push(row);
    return clone(row);
  });
}

/**
 * Edits a table code. `code` itself is never changed — the landing page tells
 * owners "The code never changes, even when your menu does", and stands are
 * already printed.
 */
export async function updateTableCode(
  id: string,
  patch: Partial<Omit<TableCode, "id" | "code" | "restaurantId" | "createdAt">>,
): Promise<TableCode | null> {
  return write((db) => {
    const row = db.tableCodes.find((c) => c.id === id);
    if (!row) return null;
    Object.assign(row, patch);
    return clone(row);
  });
}

export async function deleteTableCode(id: string): Promise<void> {
  await write((db) => {
    db.tableCodes = db.tableCodes.filter((c) => c.id !== id);
  });
}

export async function codeAvailable(code: string): Promise<boolean> {
  const db = await read();
  const wanted = code.trim().toUpperCase();
  return !db.tableCodes.some((c) => c.code.toUpperCase() === wanted);
}

export async function recordScan(id: string): Promise<void> {
  await write((db) => {
    const row = db.tableCodes.find((c) => c.id === id);
    if (!row) return;
    row.scans += 1;
    row.lastScanAt = new Date().toISOString();
  });
}

/* ------------------------------------------------------------- analytics --- */

export async function recordEvent(input: {
  restaurantId: string;
  kind: EventKind;
  dishId?: string | null;
  tableCodeId?: string | null;
  seconds?: number | null;
  device?: AnalyticsEvent["device"];
  tableNumber?: string | null;
}): Promise<void> {
  await write((db) => {
    db.events.push({
      id: randomUUID(),
      restaurantId: input.restaurantId,
      dishId: input.dishId ?? null,
      tableCodeId: input.tableCodeId ?? null,
      kind: input.kind,
      seconds: input.seconds ?? null,
      device: input.device ?? "unknown",
      tableNumber: input.tableNumber ?? null,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function listEvents(
  restaurantId: string,
  sinceDays?: number,
): Promise<AnalyticsEvent[]> {
  const db = await read();
  const cutoff = sinceDays ? Date.now() - sinceDays * 86400000 : 0;
  return clone(
    db.events.filter(
      (e) => e.restaurantId === restaurantId && Date.parse(e.createdAt) >= cutoff,
    ),
  );
}

/* ---------------------------------------------------------------- orders --- */

export async function listOrders(
  restaurantId: string,
  status?: OrderStatus,
): Promise<Order[]> {
  const db = await read();
  let rows = db.orders.filter((o) => o.restaurantId === restaurantId);
  if (status) rows = rows.filter((o) => o.status === status);
  return clone(rows).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function createOrder(input: {
  restaurantId: string;
  tableNumber: string | null;
  items: Order["items"];
  currency: string;
  note?: string;
}): Promise<Order> {
  return write((db) => {
    const now = new Date().toISOString();
    const order: Order = {
      id: randomUUID(),
      restaurantId: input.restaurantId,
      tableNumber: input.tableNumber,
      items: input.items,
      totalMinor: input.items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0),
      currency: input.currency,
      note: input.note ?? "",
      status: "new",
      createdAt: now,
      updatedAt: now,
    };
    db.orders.push(order);
    return clone(order);
  });
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order | null> {
  return write((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return clone(order);
  });
}

/* --------------------------------------------------------------- reviews --- */

export async function listReviews(dishId: string): Promise<Review[]> {
  const db = await read();
  return clone(db.reviews.filter((r) => r.dishId === dishId)).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export async function createReview(input: {
  restaurantId: string;
  dishId: string;
  rating: number;
  comment: string;
  author: string;
}): Promise<Review> {
  return write((db) => {
    const review: Review = {
      id: randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    db.reviews.push(review);

    // Keep the dish's own rating in step with its reviews.
    const dish = db.dishes.find((d) => d.id === input.dishId);
    if (dish) {
      const total = dish.rating * dish.ratingCount + input.rating;
      dish.ratingCount += 1;
      dish.rating = Math.round((total / dish.ratingCount) * 10) / 10;
    }
    return clone(review);
  });
}

/* ----------------------------------------------------------------- leads --- */

export async function createLead(input: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
  return write((db) => {
    const lead: Lead = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    db.leads.push(lead);
    return clone(lead);
  });
}

export async function listLeads(): Promise<Lead[]> {
  const db = await read();
  return clone(db.leads).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

/* ---------------------------------------------------------------- outbox --- */

/**
 * Records a message instead of sending it. Connecting a real provider
 * (Resend, SES, SMTP) means replacing this one function.
 */
export async function queueMail(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  await write((db) => {
    db.outbox.push({ id: randomUUID(), ...input, createdAt: new Date().toISOString() });
  });
}

/**
 * Queued mail for one address only — the outbox is shown in the dashboard, and
 * an unscoped list would hand one owner every other owner's email.
 */
export async function listOutbox(to: string): Promise<OutboxMessage[]> {
  const db = await read();
  const wanted = to.trim().toLowerCase();
  return clone(
    db.outbox.filter((m) => m.to.trim().toLowerCase() === wanted),
  ).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
