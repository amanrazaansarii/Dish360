/**
 * Dish360 domain model.
 *
 * These shapes are the contract between the storage adapter (`lib/db`) and the
 * rest of the app. Keeping them adapter-agnostic is what lets the local JSON
 * store be swapped for Supabase without touching any screen.
 */

export type PlanId = "free" | "pro" | "enterprise";

export type UserRole = "owner" | "manager" | "staff";

export interface User {
  id: string;
  email: string;
  name: string;
  /** scrypt hash, formatted `scrypt:<salt-hex>:<key-hex>` */
  passwordHash: string;
  restaurantId: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface OpeningHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  open: string;
  close: string;
  closed: boolean;
}

export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  about: string;
  cuisine: string[];
  city: string;
  address: string;
  phone: string;
  website: string;
  logoUrl: string | null;
  /** hex; tints the accents on the guest-facing menu */
  brandColor: string;
  currency: string;
  plan: PlanId;
  hours: OpeningHours[];
  /** until this is true the menu is not listed and shows to nobody */
  published: boolean;
  /**
   * Switched off by Dish360 (unpaid, abuse). The menu and its codes stop
   * answering guests and the owner sees why; nothing is deleted.
   */
  suspended: boolean;
  /** What they pay for, set from the admin panel. */
  subscription: Subscription;
  createdAt: string;
}

export type SubscriptionStatus =
  /** trying it out; billed once the trial ends */
  | "trial"
  /** paying */
  | "active"
  /** a payment is late */
  | "past_due"
  /** stopped paying; kept on the plan they had until it is changed */
  | "cancelled"
  /** on the house: demos, partners, our own test accounts */
  | "comped";

export type BillingInterval = "month" | "year";

export interface Subscription {
  status: SubscriptionStatus;
  interval: BillingInterval;
  /**
   * A price agreed for this place only, in the billing currency's minor unit.
   * `null` follows the plan's list price, so changing a price in the admin
   * panel moves everyone who has no deal of their own.
   */
  customPriceMinor: number | null;
  startedAt: string;
  /** when the next payment is due; `null` when nothing is due */
  renewsAt: string | null;
  trialEndsAt: string | null;
  note: string;
}

export type DietTag =
  | "veg"
  | "vegan"
  | "egg"
  | "jain"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "halal";

/**
 * Where a dish's 3D model is in the pipeline.
 *
 * `ready` means the model exists; it is deliberately *not* enough to show it to
 * a guest. The landing page promises "You check every dish and approve it
 * before any guest sees it", so `approved` is a separate gate the owner
 * controls — see `isLiveInAr` in `lib/dish.ts`.
 */
export type ModelStatus = "none" | "building" | "ready" | "failed";

export type ModelEnvironment = "warm" | "studio" | "neutral" | "soft";

export interface DishModel {
  status: ModelStatus;
  /** route that streams the .glb, for Android and desktop */
  glbUrl: string | null;
  /** route that streams the .usdz, for iPhone and iPad */
  usdzUrl: string | null;
  provider: "built-in" | "3daistudio" | "upload" | null;
  vertices: number | null;
  /** the owner has checked this model and released it to guests */
  approved: boolean;
  approvedAt: string | null;

  /** presentation, set in the 3D preview and shown to guests exactly as saved */
  scale: number;
  exposure: number;
  shadowIntensity: number;
  shadowSoftness: number;
  autoRotate: boolean;
  environment: ModelEnvironment;

  error: string | null;
  updatedAt: string | null;
}

export interface Dish {
  id: string;
  restaurantId: string;
  categoryId: string | null;
  name: string;
  description: string;
  /** paise — integers only, so prices never drift */
  priceMinor: number;
  currency: string;
  /** the owner's photo; the guest menu falls back to generated art without one */
  imageUrl: string | null;
  calories: number | null;
  ingredients: string[];
  allergens: string[];
  dietTags: DietTag[];
  /** 0 none · 1 mild · 2 medium · 3 hot */
  spiceLevel: 0 | 1 | 2 | 3;
  prepMinutes: number | null;
  /** 0–100; colours the generated art and the flavour view in AR */
  flavour: { savoury: number; sweet: number; tang: number; heat: number };
  rating: number;
  ratingCount: number;
  /** temporarily off — still listed, marked unavailable */
  soldOut: boolean;
  featured: boolean;
  published: boolean;
  sortIndex: number;
  model: DishModel;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  sortIndex: number;
}

export type TableCodeTarget = "menu" | "dish";

/**
 * A code printed on a small stand for one table.
 *
 * The landing page promises "The code never changes, even when your menu does",
 * so `code` is written once at creation and never rewritten — everything else
 * about the table can be edited freely.
 */
export interface TableCode {
  id: string;
  restaurantId: string;
  /** the short public code in /t/<code>; permanent once printed */
  code: string;
  label: string;
  target: TableCodeTarget;
  targetDishId: string | null;
  tableNumber: string | null;
  scans: number;
  lastScanAt: string | null;
  active: boolean;
  createdAt: string;
}

export type EventKind =
  | "scan"
  | "menu_view"
  | "dish_view"
  | "ar_open"
  | "ar_close"
  | "order"
  | "model_built";

export interface AnalyticsEvent {
  id: string;
  restaurantId: string;
  dishId: string | null;
  tableCodeId: string | null;
  kind: EventKind;
  /** seconds a guest spent looking at the dish in AR; only on `ar_close` */
  seconds: number | null;
  device: "iphone" | "android" | "computer" | "unknown";
  tableNumber: string | null;
  createdAt: string;
}

export type OrderStatus = "new" | "accepted" | "served" | "cancelled";

export interface OrderItem {
  dishId: string;
  name: string;
  priceMinor: number;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableNumber: string | null;
  items: OrderItem[];
  totalMinor: number;
  currency: string;
  note: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  restaurantId: string;
  dishId: string;
  rating: number;
  comment: string;
  author: string;
  createdAt: string;
}

export type LeadSource = "demo" | "contact" | "upgrade";
export type LeadStatus = "new" | "contacted" | "won" | "lost";

/**
 * An inquiry: a demo request from the home page, a message from the contact
 * page, or an owner asking to change plan from their dashboard.
 */
export interface Lead {
  id: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string;
  restaurantName: string;
  city: string;
  message: string;
  /** set when the inquiry comes from a signed-in owner */
  restaurantId: string | null;
  /** the plan an owner asked to move to */
  requestedPlan: PlanId | null;
  /** Dish360's own notes on the conversation; never shown to the sender */
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------- platform --- */

export type PaymentMethod = "upi" | "bank" | "card" | "cash" | "other";

/** Money received from a restaurant, recorded from the admin panel. */
export interface Payment {
  id: string;
  restaurantId: string;
  amountMinor: number;
  currency: string;
  method: PaymentMethod;
  reference: string;
  note: string;
  /** the period it pays for */
  periodStart: string | null;
  periodEnd: string | null;
  paidAt: string;
  createdAt: string;
}

/** One attempt at building a dish's 3D, and what it cost. */
export interface AssetJob {
  id: string;
  restaurantId: string;
  dishId: string;
  dishName: string;
  provider: "built-in" | "3daistudio";
  /**
   * succeeded · failed · fallback (the paid service was tried, failed, and the
   * built-in builder made the model instead — the attempt may still be billed)
   */
  outcome: "succeeded" | "failed" | "fallback";
  /** what the provider charges for it, in `costCurrency`'s minor unit */
  costMinor: number;
  costCurrency: string;
  milliseconds: number;
  error: string | null;
  createdAt: string;
}

export interface PlanFeatures {
  /** guests can send an order from the dish */
  ordering: boolean;
  /** the menu takes the restaurant's own colour */
  brandColours: boolean;
  /** the owner can download the .glb / .usdz files */
  modelDownloads: boolean;
  /** printable table stands */
  printStands: boolean;
  /** no "Menu by Dish360" line under the menu */
  removeCredit: boolean;
}

/** A plan as Dish360 sells it. Edited in the admin panel. */
export interface PlanConfig {
  id: PlanId;
  name: string;
  summary: string;
  /** list prices, in `PlatformSettings.currency`'s minor unit; 0 is free */
  priceMonthlyMinor: number;
  priceYearlyMinor: number;
  /** `null` is unlimited */
  dishLimit: number | null;
  tableCodeLimit: number | null;
  /** 3D builds a place may start per calendar month; `null` is unlimited */
  monthlyBuildLimit: number | null;
  features: PlanFeatures;
  /** extra lines for the plan card, beyond the limits and features */
  extras: string[];
}

export interface PlatformSettings {
  /** what restaurants are billed in */
  currency: string;
  plans: PlanConfig[];
  /** what the paid 3D service charges per model, for the cost reports */
  apiCostPerBuildMinor: number;
  apiCostCurrency: string;
  /** how many days a new sign-up spends on trial */
  trialDays: number;
  updatedAt: string;
}

/** A single-use link to set a new password. Only the token's hash is kept. */
export interface PasswordReset {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

/** Outgoing mail is recorded rather than sent until a provider is connected. */
export interface OutboxMessage {
  id: string;
  to: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface Database {
  version: number;
  users: User[];
  sessions: Session[];
  restaurants: Restaurant[];
  categories: Category[];
  dishes: Dish[];
  tableCodes: TableCode[];
  events: AnalyticsEvent[];
  orders: Order[];
  reviews: Review[];
  leads: Lead[];
  outbox: OutboxMessage[];
  payments: Payment[];
  assetJobs: AssetJob[];
  passwordResets: PasswordReset[];
  settings: PlatformSettings;
}
