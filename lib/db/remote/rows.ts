import type {
  AnalyticsEvent,
  Category,
  Dish,
  DishModel,
  Lead,
  Order,
  OutboxMessage,
  Restaurant,
  Review,
  Session,
  TableCode,
  User,
} from "@/lib/types";

/**
 * Postgres rows in, domain objects out.
 *
 * Postgres is snake_case and the domain is camelCase, and this is the only
 * place that knows it. Everything above `lib/db` sees the same shapes whichever
 * backend is running.
 */

type Row = Record<string, unknown>;

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" ? value : fallback;

const numOrNull = (value: unknown): number | null =>
  typeof value === "number" ? value : null;

const bool = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

const strOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

/** Postgres gives timestamptz back in its own format; the app speaks ISO. */
const iso = (value: unknown): string =>
  typeof value === "string" ? new Date(value).toISOString() : new Date(0).toISOString();

const isoOrNull = (value: unknown): string | null =>
  typeof value === "string" ? new Date(value).toISOString() : null;

/* ---------------------------------------------------------------- reading --- */

export function toUser(row: Row): User {
  return {
    id: str(row.id),
    email: str(row.email),
    name: str(row.name),
    passwordHash: str(row.password_hash),
    restaurantId: str(row.restaurant_id),
    role: (str(row.role, "owner") as User["role"]) ?? "owner",
    createdAt: iso(row.created_at),
  };
}

export function toSession(row: Row): Session {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    createdAt: iso(row.created_at),
    expiresAt: iso(row.expires_at),
  };
}

export function toRestaurant(row: Row): Restaurant {
  return {
    id: str(row.id),
    slug: str(row.slug),
    name: str(row.name),
    tagline: str(row.tagline),
    about: str(row.about),
    cuisine: list(row.cuisine),
    city: str(row.city),
    address: str(row.address),
    phone: str(row.phone),
    website: str(row.website),
    logoUrl: strOrNull(row.logo_url),
    brandColor: str(row.brand_color, "#aad0af"),
    currency: str(row.currency, "INR"),
    plan: (str(row.plan, "free") as Restaurant["plan"]) ?? "free",
    hours: Array.isArray(row.hours)
      ? (row.hours as Restaurant["hours"])
      : [0, 1, 2, 3, 4, 5, 6].map((day) => ({
          day,
          open: "09:00",
          close: "22:00",
          closed: false,
        })),
    published: bool(row.published),
    createdAt: iso(row.created_at),
  };
}

export function toCategory(row: Row): Category {
  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    name: str(row.name),
    description: str(row.description),
    sortIndex: num(row.sort_index),
  };
}

function toModel(value: unknown): DishModel {
  const raw = (value ?? {}) as Row;
  return {
    status: (str(raw.status, "none") as DishModel["status"]) ?? "none",
    glbUrl: strOrNull(raw.glbUrl),
    usdzUrl: strOrNull(raw.usdzUrl),
    provider: (raw.provider as DishModel["provider"]) ?? null,
    vertices: numOrNull(raw.vertices),
    approved: bool(raw.approved),
    approvedAt: strOrNull(raw.approvedAt),
    scale: num(raw.scale, 1),
    exposure: num(raw.exposure, 1),
    shadowIntensity: num(raw.shadowIntensity, 1),
    shadowSoftness: num(raw.shadowSoftness, 0.8),
    autoRotate: bool(raw.autoRotate, true),
    environment: (str(raw.environment, "warm") as DishModel["environment"]) ?? "warm",
    error: strOrNull(raw.error),
    updatedAt: strOrNull(raw.updatedAt),
  };
}

export function toDish(row: Row): Dish {
  const flavour = (row.flavour ?? {}) as Row;
  const spice = num(row.spice_level);

  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    categoryId: strOrNull(row.category_id),
    name: str(row.name),
    description: str(row.description),
    priceMinor: num(row.price_minor),
    currency: str(row.currency, "INR"),
    imageUrl: strOrNull(row.image_url),
    calories: numOrNull(row.calories),
    ingredients: list(row.ingredients),
    allergens: list(row.allergens),
    dietTags: list(row.diet_tags) as Dish["dietTags"],
    spiceLevel: ([0, 1, 2, 3].includes(spice) ? spice : 0) as Dish["spiceLevel"],
    prepMinutes: numOrNull(row.prep_minutes),
    flavour: {
      savoury: num(flavour.savoury, 60),
      sweet: num(flavour.sweet, 40),
      tang: num(flavour.tang, 40),
      heat: num(flavour.heat, 10),
    },
    rating: num(row.rating),
    ratingCount: num(row.rating_count),
    soldOut: bool(row.sold_out),
    featured: bool(row.featured),
    published: bool(row.published),
    sortIndex: num(row.sort_index),
    model: toModel(row.model),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function toTableCode(row: Row): TableCode {
  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    code: str(row.code),
    label: str(row.label),
    target: (str(row.target, "menu") as TableCode["target"]) ?? "menu",
    targetDishId: strOrNull(row.target_dish_id),
    tableNumber: strOrNull(row.table_number),
    scans: num(row.scans),
    lastScanAt: isoOrNull(row.last_scan_at),
    active: bool(row.active, true),
    createdAt: iso(row.created_at),
  };
}

export function toEvent(row: Row): AnalyticsEvent {
  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    dishId: strOrNull(row.dish_id),
    tableCodeId: strOrNull(row.table_code_id),
    kind: str(row.kind) as AnalyticsEvent["kind"],
    seconds: numOrNull(row.seconds),
    device: (str(row.device, "unknown") as AnalyticsEvent["device"]) ?? "unknown",
    tableNumber: strOrNull(row.table_number),
    createdAt: iso(row.created_at),
  };
}

export function toOrder(row: Row): Order {
  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    tableNumber: strOrNull(row.table_number),
    items: Array.isArray(row.items) ? (row.items as Order["items"]) : [],
    totalMinor: num(row.total_minor),
    currency: str(row.currency, "INR"),
    note: str(row.note),
    status: (str(row.status, "new") as Order["status"]) ?? "new",
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function toReview(row: Row): Review {
  return {
    id: str(row.id),
    restaurantId: str(row.restaurant_id),
    dishId: str(row.dish_id),
    rating: num(row.rating),
    comment: str(row.comment),
    author: str(row.author),
    createdAt: iso(row.created_at),
  };
}

export function toLead(row: Row): Lead {
  return {
    id: str(row.id),
    name: str(row.name),
    email: str(row.email),
    phone: str(row.phone),
    restaurantName: str(row.restaurant_name),
    message: str(row.message),
    createdAt: iso(row.created_at),
  };
}

export function toOutbox(row: Row): OutboxMessage {
  return {
    id: str(row.id),
    to: str(row.to),
    subject: str(row.subject),
    body: str(row.body),
    createdAt: iso(row.created_at),
  };
}

/* ---------------------------------------------------------------- writing --- */

/** Only the keys actually present become columns, so a patch stays a patch. */
export function restaurantColumns(patch: Partial<Restaurant>): Row {
  const row: Row = {};
  if (patch.slug !== undefined) row.slug = patch.slug;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.tagline !== undefined) row.tagline = patch.tagline;
  if (patch.about !== undefined) row.about = patch.about;
  if (patch.cuisine !== undefined) row.cuisine = patch.cuisine;
  if (patch.city !== undefined) row.city = patch.city;
  if (patch.address !== undefined) row.address = patch.address;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.website !== undefined) row.website = patch.website;
  if (patch.logoUrl !== undefined) row.logo_url = patch.logoUrl;
  if (patch.brandColor !== undefined) row.brand_color = patch.brandColor;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.hours !== undefined) row.hours = patch.hours;
  if (patch.published !== undefined) row.published = patch.published;
  return row;
}

export function dishColumns(patch: Partial<Dish>): Row {
  const row: Row = {};
  if (patch.categoryId !== undefined) row.category_id = patch.categoryId;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.priceMinor !== undefined) row.price_minor = patch.priceMinor;
  if (patch.currency !== undefined) row.currency = patch.currency;
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
  if (patch.calories !== undefined) row.calories = patch.calories;
  if (patch.ingredients !== undefined) row.ingredients = patch.ingredients;
  if (patch.allergens !== undefined) row.allergens = patch.allergens;
  if (patch.dietTags !== undefined) row.diet_tags = patch.dietTags;
  if (patch.spiceLevel !== undefined) row.spice_level = patch.spiceLevel;
  if (patch.prepMinutes !== undefined) row.prep_minutes = patch.prepMinutes;
  if (patch.flavour !== undefined) row.flavour = patch.flavour;
  if (patch.rating !== undefined) row.rating = patch.rating;
  if (patch.ratingCount !== undefined) row.rating_count = patch.ratingCount;
  if (patch.soldOut !== undefined) row.sold_out = patch.soldOut;
  if (patch.featured !== undefined) row.featured = patch.featured;
  if (patch.published !== undefined) row.published = patch.published;
  if (patch.sortIndex !== undefined) row.sort_index = patch.sortIndex;
  if (patch.model !== undefined) row.model = patch.model;
  return row;
}

export function tableCodeColumns(patch: Partial<TableCode>): Row {
  const row: Row = {};
  // `code` is deliberately absent: the stand is already printed.
  if (patch.label !== undefined) row.label = patch.label;
  if (patch.target !== undefined) row.target = patch.target;
  if (patch.targetDishId !== undefined) row.target_dish_id = patch.targetDishId;
  if (patch.tableNumber !== undefined) row.table_number = patch.tableNumber;
  if (patch.scans !== undefined) row.scans = patch.scans;
  if (patch.lastScanAt !== undefined) row.last_scan_at = patch.lastScanAt;
  if (patch.active !== undefined) row.active = patch.active;
  return row;
}
