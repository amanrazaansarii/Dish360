"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  codeAvailable,
  createCategory,
  createDish,
  createTableCode,
  deleteCategory,
  deleteDish,
  deleteTableCode,
  findUserByEmail,
  listCategories,
  listDishes,
  listOrders,
  listTableCodes,
  recordEvent,
  reorderDishes,
  setModelApproved,
  slugAvailable,
  updateCategory,
  updateDish,
  updateDishModel,
  updateOrderStatus,
  updateRestaurant,
  updateTableCode,
  updateUser,
} from "@/lib/db";
import { getAuth } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { dishLimitReached, tableCodeLimitReached } from "@/lib/plans";
import { convertDish } from "@/lib/ar/pipeline";
import { parseMoney, slugify } from "@/lib/utils";
import type { DietTag, Dish, ModelEnvironment, OrderStatus, PlanId } from "@/lib/types";

/**
 * Everything the owner can change.
 *
 * Every action checks who is signed in and that the thing being changed belongs
 * to them. Server Actions can be posted to directly, so ownership is never
 * taken from the request.
 */

export interface ActionState {
  error?: string;
  done?: string;
  fieldErrors?: Record<string, string>;
}

async function owner() {
  const auth = await getAuth();
  if (!auth) redirect("/signin?next=/dashboard");
  return auth;
}

/** Loads a dish only when it is on the signed-in owner's menu. */
async function ownDish(dishId: string, restaurantId: string): Promise<Dish | null> {
  const dishes = await listDishes(restaurantId);
  return dishes.find((d) => d.id === dishId) ?? null;
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const DIET_TAGS: DietTag[] = [
  "veg",
  "vegan",
  "egg",
  "jain",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "halal",
];

function splitList(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pct(value: string, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, Math.round(parsed)));
}

/** Refreshes everywhere a dish shows: the owner's screens and the guest menu. */
function revalidateDish(slug: string, dishId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/menu");
  if (dishId) revalidatePath(`/dashboard/menu/${dishId}`);
  revalidatePath(`/m/${slug}`);
  if (dishId) revalidatePath(`/m/${slug}/${dishId}`);
  revalidatePath("/menus");
}

/* ----------------------------------------------------------------- dishes --- */

const dishSchema = z.object({
  name: z.string().trim().min(2, "Give the dish a name"),
  description: z.string().trim().max(1200, "That is very long").optional().default(""),
  price: z.string().optional().default("0"),
  categoryId: z.string().optional().default(""),
  calories: z.string().optional().default(""),
  prepMinutes: z.string().optional().default(""),
  ingredients: z.string().optional().default(""),
  allergens: z.string().optional().default(""),
  spiceLevel: z.string().optional().default("0"),
  imageUrl: z.string().optional().default(""),
  savoury: z.string().optional().default("60"),
  sweet: z.string().optional().default("40"),
  tang: z.string().optional().default("40"),
  heat: z.string().optional().default("10"),
});

function dishFrom(formData: FormData, parsed: z.infer<typeof dishSchema>) {
  const spice = Number(parsed.spiceLevel);
  return {
    name: parsed.name,
    description: parsed.description,
    priceMinor: parseMoney(parsed.price),
    categoryId: parsed.categoryId || null,
    calories: numberOrNull(parsed.calories),
    prepMinutes: numberOrNull(parsed.prepMinutes),
    ingredients: splitList(parsed.ingredients),
    allergens: splitList(parsed.allergens),
    dietTags: DIET_TAGS.filter((tag) => formData.get(`diet.${tag}`) === "on"),
    spiceLevel: ([0, 1, 2, 3].includes(spice) ? spice : 0) as 0 | 1 | 2 | 3,
    imageUrl: parsed.imageUrl || null,
    flavour: {
      savoury: pct(parsed.savoury, 60),
      sweet: pct(parsed.sweet, 40),
      tang: pct(parsed.tang, 40),
      heat: pct(parsed.heat, 10),
    },
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    soldOut: formData.get("soldOut") === "on",
  };
}

export async function createDishAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();

  const parsed = dishSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const existing = await listDishes(restaurant.id);
  const full = dishLimitReached(restaurant.plan, existing.length);
  if (full) return { error: full };

  const dish = await createDish({
    restaurantId: restaurant.id,
    currency: restaurant.currency,
    ...dishFrom(formData, parsed.data),
  });

  revalidateDish(restaurant.slug, dish.id);
  redirect(`/dashboard/menu/${dish.id}?new=1`);
}

export async function updateDishAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");

  if (!(await ownDish(dishId, restaurant.id))) {
    return { error: "That dish is not on your menu." };
  }

  const parsed = dishSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  await updateDish(dishId, dishFrom(formData, parsed.data));
  revalidateDish(restaurant.slug, dishId);
  return { done: "Saved. Every table shows it now." };
}

/** The switches on the menu list: sold out, shown, featured. */
export async function toggleDishAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  const field = String(formData.get("field") ?? "");

  const dish = await ownDish(dishId, restaurant.id);
  if (!dish) return;

  if (field === "soldOut") await updateDish(dishId, { soldOut: !dish.soldOut });
  else if (field === "published") await updateDish(dishId, { published: !dish.published });
  else if (field === "featured") await updateDish(dishId, { featured: !dish.featured });

  revalidateDish(restaurant.slug, dishId);
}

export async function setDishPriceAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  if (!(await ownDish(dishId, restaurant.id))) return;

  await updateDish(dishId, { priceMinor: parseMoney(String(formData.get("price") ?? "")) });
  revalidateDish(restaurant.slug, dishId);
}

export async function deleteDishAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  if (!(await ownDish(dishId, restaurant.id))) return;

  await deleteDish(dishId);
  revalidateDish(restaurant.slug);
  revalidatePath("/dashboard/codes");
  redirect("/dashboard/menu?removed=1");
}

export async function reorderDishesAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const ids = String(formData.get("ids") ?? "").split(",").filter(Boolean);

  const mine = new Set((await listDishes(restaurant.id)).map((d) => d.id));
  await reorderDishes(ids.filter((id) => mine.has(id)));
  revalidateDish(restaurant.slug);
}

/* --------------------------------------------------------------- the 3D --- */

export async function buildModelAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");

  const dish = await ownDish(dishId, restaurant.id);
  if (!dish) return { error: "That dish is not on your menu." };

  await updateDishModel(dishId, { status: "building", error: null });

  try {
    const result = await convertDish(dish);
    await updateDishModel(dishId, {
      status: "ready",
      provider: result.provider,
      vertices: result.vertices,
      glbUrl: `/api/model/${dishId}/model.glb`,
      usdzUrl: `/api/model/${dishId}/model.usdz`,
      // Rebuilding always sends it back for checking. The owner approved the
      // last model, not this one.
      approved: false,
      approvedAt: null,
      error: null,
    });
    await recordEvent({
      restaurantId: restaurant.id,
      dishId,
      kind: "model_built",
      device: "computer",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The build failed.";
    await updateDishModel(dishId, { status: "failed", error: message });
    return { error: message };
  }

  revalidateDish(restaurant.slug, dishId);
  revalidatePath(`/view/${dishId}`);
  return { done: "Built. Have a look, then release it to your guests." };
}

/** Step 2 of the home page: the owner releases the model to guests. */
export async function approveModelAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  const approve = String(formData.get("approve") ?? "") === "1";

  const dish = await ownDish(dishId, restaurant.id);
  if (!dish || dish.model.status !== "ready") return;

  await setModelApproved(dishId, approve);
  revalidateDish(restaurant.slug, dishId);
  revalidatePath(`/view/${dishId}`);
}

export async function saveModelLookAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  if (!(await ownDish(dishId, restaurant.id))) return;

  const num = (key: string, fallback: number) => {
    const value = Number(formData.get(key));
    return Number.isFinite(value) ? value : fallback;
  };

  await updateDishModel(dishId, {
    exposure: num("exposure", 1),
    shadowIntensity: num("shadowIntensity", 1),
    shadowSoftness: num("shadowSoftness", 0.8),
    scale: num("scale", 1),
    autoRotate: formData.get("autoRotate") === "true",
    environment: (String(formData.get("environment")) as ModelEnvironment) || "warm",
  });

  revalidateDish(restaurant.slug, dishId);
  revalidatePath(`/view/${dishId}`);
}

export async function removeModelAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const dishId = String(formData.get("dishId") ?? "");
  if (!(await ownDish(dishId, restaurant.id))) return;

  await updateDishModel(dishId, {
    status: "none",
    glbUrl: null,
    usdzUrl: null,
    provider: null,
    vertices: null,
    approved: false,
    approvedAt: null,
    error: null,
  });

  revalidateDish(restaurant.slug, dishId);
}

/* ------------------------------------------------------------- sections --- */

export async function createSectionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Give the section a name." };

  await createCategory({
    restaurantId: restaurant.id,
    name,
    description: String(formData.get("description") ?? "").trim(),
  });

  revalidateDish(restaurant.slug);
  return { done: "Section added." };
}

export async function renameSectionAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const categoryId = String(formData.get("categoryId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return;

  const mine = await listCategories(restaurant.id);
  if (!mine.some((c) => c.id === categoryId)) return;

  await updateCategory(categoryId, { name });
  revalidateDish(restaurant.slug);
}

export async function deleteSectionAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const categoryId = String(formData.get("categoryId") ?? "");

  const mine = await listCategories(restaurant.id);
  if (!mine.some((c) => c.id === categoryId)) return;

  await deleteCategory(categoryId);
  revalidateDish(restaurant.slug);
}

/* ---------------------------------------------------------- table codes --- */

const codeSchema = z.object({
  label: z.string().trim().min(1, "Give it a label, like “Table 4”"),
  target: z.enum(["menu", "dish"]).optional().default("menu"),
  targetDishId: z.string().optional().default(""),
  tableNumber: z.string().trim().optional().default(""),
});

export async function createCodeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();

  const parsed = codeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const existing = await listTableCodes(restaurant.id);
  const full = tableCodeLimitReached(restaurant.plan, existing.length);
  if (full) return { error: full };

  if (parsed.data.target === "dish" && parsed.data.targetDishId) {
    if (!(await ownDish(parsed.data.targetDishId, restaurant.id))) {
      return { error: "That dish is not on your menu." };
    }
  }

  // Codes get typed off a printed card by staff, so keep them short and plain.
  const prefix = (restaurant.slug.slice(0, 3) || "d36").toUpperCase();
  const stem = parsed.data.tableNumber
    ? `${prefix}-T${parsed.data.tableNumber.padStart(2, "0")}`
    : `${prefix}-${String(existing.length + 1).padStart(3, "0")}`;

  let code = stem;
  let attempt = 2;
  while (!(await codeAvailable(code))) {
    code = `${stem}-${attempt}`;
    attempt += 1;
  }

  await createTableCode({
    restaurantId: restaurant.id,
    code,
    label: parsed.data.label,
    target: parsed.data.target,
    targetDishId: parsed.data.target === "dish" ? parsed.data.targetDishId || null : null,
    tableNumber: parsed.data.tableNumber || null,
  });

  revalidatePath("/dashboard/codes");
  revalidatePath("/dashboard");
  return { done: `Made ${code}. Print it and put it on the table.` };
}

/** Numbers a run of tables in one go — the usual case for a new room. */
export async function createCodeRunAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();

  const from = Math.max(1, Number(formData.get("from") ?? 1));
  const to = Math.max(from, Number(formData.get("to") ?? from));
  const wanted = to - from + 1;
  if (wanted > 100) return { error: "Up to 100 at a time." };

  const existing = await listTableCodes(restaurant.id);
  const full = tableCodeLimitReached(restaurant.plan, existing.length + wanted - 1);
  if (full) return { error: full };

  const prefix = (restaurant.slug.slice(0, 3) || "d36").toUpperCase();
  let made = 0;

  for (let n = from; n <= to; n += 1) {
    const table = String(n).padStart(2, "0");
    const code = `${prefix}-T${table}`;
    if (!(await codeAvailable(code))) continue;
    await createTableCode({
      restaurantId: restaurant.id,
      code,
      label: `Table ${table}`,
      target: "menu",
      tableNumber: table,
    });
    made += 1;
  }

  revalidatePath("/dashboard/codes");
  revalidatePath("/dashboard");
  return {
    done:
      made === 0
        ? "Those tables already have codes."
        : `Made ${made} code${made === 1 ? "" : "s"}.`,
  };
}

export async function toggleCodeAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const codeId = String(formData.get("codeId") ?? "");

  const mine = await listTableCodes(restaurant.id);
  const row = mine.find((c) => c.id === codeId);
  if (!row) return;

  await updateTableCode(codeId, { active: !row.active });
  revalidatePath("/dashboard/codes");
}

export async function deleteCodeAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const codeId = String(formData.get("codeId") ?? "");

  const mine = await listTableCodes(restaurant.id);
  if (!mine.some((c) => c.id === codeId)) return;

  await deleteTableCode(codeId);
  revalidatePath("/dashboard/codes");
  revalidatePath("/dashboard");
}

/* ----------------------------------------------------------------- orders --- */

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!["new", "accepted", "served", "cancelled"].includes(status)) return;

  const mine = await listOrders(restaurant.id);
  if (!mine.some((o) => o.id === orderId)) return;

  await updateOrderStatus(orderId, status);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}

/* --------------------------------------------------------------- settings --- */

const placeSchema = z.object({
  name: z.string().trim().min(2, "Enter the name of your place"),
  slug: z.string().trim().min(2, "Enter a web address"),
  tagline: z.string().trim().max(160, "Keep it short").optional().default(""),
  about: z.string().trim().max(1500).optional().default(""),
  cuisine: z.string().optional().default(""),
  city: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default(""),
  brandColor: z.string().trim().optional().default("#aad0af"),
});

export async function updatePlaceAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { restaurant } = await owner();

  const parsed = placeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const slug = slugify(parsed.data.slug);
  if (!slug) return { fieldErrors: { slug: "That address cannot be used." } };
  if (!(await slugAvailable(slug, restaurant.id))) {
    return { fieldErrors: { slug: "Somebody else is already using that address." } };
  }

  await updateRestaurant(restaurant.id, {
    name: parsed.data.name,
    slug,
    tagline: parsed.data.tagline,
    about: parsed.data.about,
    cuisine: splitList(parsed.data.cuisine),
    city: parsed.data.city,
    address: parsed.data.address,
    phone: parsed.data.phone,
    website: parsed.data.website,
    brandColor: /^#[0-9a-fA-F]{6}$/.test(parsed.data.brandColor)
      ? parsed.data.brandColor
      : "#aad0af",
  });

  revalidatePath("/dashboard/settings");
  revalidatePath(`/m/${slug}`);
  revalidatePath("/menus");
  return { done: "Saved." };
}

export async function togglePublishedAction(): Promise<void> {
  const { restaurant } = await owner();
  await updateRestaurant(restaurant.id, { published: !restaurant.published });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/m/${restaurant.slug}`);
  revalidatePath("/menus");
}

export async function updateHoursAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();

  const hours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: String(formData.get(`open.${day}`) ?? "09:00"),
    close: String(formData.get(`close.${day}`) ?? "22:00"),
    closed: formData.get(`closed.${day}`) === "on",
  }));

  await updateRestaurant(restaurant.id, { hours });
  revalidatePath("/dashboard/settings");
  revalidatePath(`/m/${restaurant.slug}`);
}

export async function changePlanAction(formData: FormData): Promise<void> {
  const { restaurant } = await owner();
  const plan = String(formData.get("plan") ?? "") as PlanId;
  if (!["free", "pro", "enterprise"].includes(plan)) return;

  // No payment provider is connected, so this simply applies the plan and its
  // limits. Gate it behind a provider's webhook before charging anybody.
  await updateRestaurant(restaurant.id, { plan });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("That does not look like an email"),
});

export async function updateProfileAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await owner();

  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: fieldErrorsFrom(parsed.error) };

  const clash = await findUserByEmail(parsed.data.email);
  if (clash && clash.id !== user.id) {
    return { fieldErrors: { email: "Another account already uses that email." } };
  }

  await updateUser(user.id, { name: parsed.data.name, email: parsed.data.email });
  revalidatePath("/dashboard/settings");
  return { done: "Saved." };
}

export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await owner();

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");

  if (next.length < 8) {
    return { fieldErrors: { newPassword: "Use at least 8 characters" } };
  }
  if (!(await verifyPassword(current, user.passwordHash))) {
    return { fieldErrors: { currentPassword: "That is not your current password" } };
  }

  await updateUser(user.id, { passwordHash: await hashPassword(next) });
  return { done: "Password changed." };
}
