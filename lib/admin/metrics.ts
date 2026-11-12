import { requireAdmin } from "@/lib/auth/admin";
import {
  listAllDishes,
  listAllEvents,
  listAllOrders,
  listAllTableCodes,
  listAssetJobs,
  listLeads,
  listPayments,
  listRestaurants,
  listUsers,
} from "@/lib/db";
import { settings } from "@/lib/platform";
import { monthlyValue, planFrom, subscriptionPrice } from "@/lib/plans";
import type {
  AssetJob,
  Lead,
  Payment,
  PlanConfig,
  PlatformSettings,
  Restaurant,
  User,
} from "@/lib/types";

/**
 * The numbers behind the admin panel, worked out from the same records the
 * app writes. Nothing here is estimated: revenue is payments recorded, MRR is
 * what active subscriptions are priced at, API spend is builds logged times
 * the price per build that was set when each one ran.
 */

const DAY = 86400000;

export interface RestaurantRow {
  restaurant: Restaurant;
  owners: User[];
  plan: PlanConfig;
  /** per billing period */
  price: number;
  /** spread over a month; 0 unless active or past due */
  mrr: number;
  dishes: number;
  models: number;
  approved: number;
  codes: number;
  scans30: number;
  arOpens30: number;
  orders30: number;
  /** in the restaurant's own currency */
  orderValue30: number;
  paidTotal: number;
  lastPaymentAt: string | null;
  builds: number;
  buildsThisMonth: number;
  apiSpend: number;
}

export interface MonthBucket {
  key: string;
  label: string;
  value: number;
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function lastMonths(count: number, now = new Date()): MonthBucket[] {
  const out: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: d.toLocaleDateString("en-IN", { month: "short" }), value: 0 });
  }
  return out;
}

export interface Overview {
  platform: PlatformSettings;
  rows: RestaurantRow[];
  payments: Payment[];
  jobs: AssetJob[];
  leads: Lead[];
  totals: {
    restaurants: number;
    live: number;
    suspended: number;
    newThisMonth: number;
    paying: number;
    trials: number;
    pastDue: number;
    comped: number;
    mrr: number;
    arr: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueAllTime: number;
    openInquiries: number;
    newInquiries: number;
  };
  revenueByMonth: MonthBucket[];
  signupsByMonth: MonthBucket[];
  assets: {
    models: number;
    approved: number;
    buildsThisMonth: number;
    buildsAllTime: number;
    failedThisMonth: number;
    paidBuildsThisMonth: number;
    apiSpendThisMonth: number;
    apiSpendAllTime: number;
    buildsByMonth: MonthBucket[];
  };
  guests30: {
    scans: number;
    menuViews: number;
    dishViews: number;
    arOpens: number;
    orders: number;
    orderValue: number;
  };
  /** places that need a look: trials ending, payments late or due soon */
  attention: { row: RestaurantRow; why: string; when: string | null }[];
}

export async function overview(): Promise<Overview> {
  // Pages render alongside their layout, so the layout's check alone does not
  // stop a page streaming its data. Whatever loads admin data checks itself.
  await requireAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const since30 = new Date(now.getTime() - 30 * DAY).toISOString();

  const [platform, restaurants, users, dishes, codes, payments, jobs, leads, orders30, events30] =
    await Promise.all([
      settings(),
      listRestaurants(),
      listUsers(),
      listAllDishes(),
      listAllTableCodes(),
      listPayments(),
      listAssetJobs(),
      listLeads(),
      listAllOrders(since30),
      listAllEvents(since30),
    ]);

  const by = <T extends { restaurantId: string }>(items: T[]) => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const list = map.get(item.restaurantId) ?? [];
      list.push(item);
      map.set(item.restaurantId, list);
    }
    return map;
  };
  const dishesBy = by(dishes);
  const codesBy = by(codes);
  const paymentsBy = by(payments);
  const jobsBy = by(jobs);
  const ordersBy = by(orders30);
  const eventsBy = by(events30);

  const rows: RestaurantRow[] = restaurants.map((restaurant) => {
    const plan = planFrom(platform.plans, restaurant.plan);
    const own = dishesBy.get(restaurant.id) ?? [];
    const events = eventsBy.get(restaurant.id) ?? [];
    const orders = (ordersBy.get(restaurant.id) ?? []).filter((o) => o.status !== "cancelled");
    const paid = paymentsBy.get(restaurant.id) ?? [];
    const builds = jobsBy.get(restaurant.id) ?? [];
    return {
      restaurant,
      owners: users.filter((u) => u.restaurantId === restaurant.id),
      plan,
      price: subscriptionPrice(plan, restaurant.subscription),
      mrr: monthlyValue(plan, restaurant.subscription),
      dishes: own.length,
      models: own.filter((d) => d.model.status === "ready").length,
      approved: own.filter((d) => d.model.status === "ready" && d.model.approved).length,
      codes: (codesBy.get(restaurant.id) ?? []).length,
      scans30: events.filter((e) => e.kind === "scan").length,
      arOpens30: events.filter((e) => e.kind === "ar_open").length,
      orders30: orders.length,
      orderValue30: orders.reduce((sum, o) => sum + o.totalMinor, 0),
      paidTotal: paid.reduce((sum, p) => sum + p.amountMinor, 0),
      lastPaymentAt: paid[0]?.paidAt ?? null,
      builds: builds.filter((j) => j.outcome !== "failed").length,
      buildsThisMonth: builds.filter((j) => j.outcome !== "failed" && j.createdAt >= monthStart).length,
      apiSpend: builds.reduce((sum, j) => sum + j.costMinor, 0),
    };
  });

  const revenueByMonth = lastMonths(6, now);
  for (const p of payments) {
    const bucket = revenueByMonth.find((b) => b.key === monthKey(p.paidAt));
    if (bucket) bucket.value += p.amountMinor;
  }
  const signupsByMonth = lastMonths(6, now);
  for (const r of restaurants) {
    const bucket = signupsByMonth.find((b) => b.key === monthKey(r.createdAt));
    if (bucket) bucket.value += 1;
  }
  const buildsByMonth = lastMonths(6, now);
  for (const j of jobs) {
    if (j.outcome === "failed") continue;
    const bucket = buildsByMonth.find((b) => b.key === monthKey(j.createdAt));
    if (bucket) bucket.value += 1;
  }

  const status = (s: Restaurant["subscription"]["status"]) =>
    restaurants.filter((r) => r.subscription.status === s).length;
  const mrr = rows.reduce((sum, r) => sum + r.mrr, 0);
  const sumPaid = (from: string, to?: string) =>
    payments
      .filter((p) => p.paidAt >= from && (!to || p.paidAt < to))
      .reduce((sum, p) => sum + p.amountMinor, 0);

  const monthJobs = jobs.filter((j) => j.createdAt >= monthStart);

  const attention: Overview["attention"] = [];
  const soon = now.getTime() + 7 * DAY;
  for (const row of rows) {
    const sub = row.restaurant.subscription;
    const due = sub.renewsAt ? Date.parse(sub.renewsAt) : null;
    if (sub.status === "past_due") {
      attention.push({ row, why: "Payment is late", when: sub.renewsAt });
    } else if (sub.status === "trial" && due !== null && due <= soon) {
      attention.push({ row, why: due < now.getTime() ? "Trial has ended" : "Trial ends soon", when: sub.renewsAt });
    } else if (sub.status === "active" && row.price > 0 && due !== null && due <= soon) {
      attention.push({ row, why: due < now.getTime() ? "Payment overdue" : "Payment due soon", when: sub.renewsAt });
    }
  }
  attention.sort((a, b) => Date.parse(a.when ?? "") - Date.parse(b.when ?? ""));

  const eventCount = (kind: string) => events30.filter((e) => e.kind === kind).length;
  const liveOrders = orders30.filter((o) => o.status !== "cancelled");

  return {
    platform,
    rows,
    payments,
    jobs,
    leads,
    totals: {
      restaurants: restaurants.length,
      live: restaurants.filter((r) => r.published && !r.suspended).length,
      suspended: restaurants.filter((r) => r.suspended).length,
      newThisMonth: restaurants.filter((r) => r.createdAt >= monthStart).length,
      paying: rows.filter((r) => r.mrr > 0).length,
      trials: status("trial"),
      pastDue: status("past_due"),
      comped: status("comped"),
      mrr,
      arr: mrr * 12,
      revenueThisMonth: sumPaid(monthStart),
      revenueLastMonth: sumPaid(lastMonthStart, monthStart),
      revenueAllTime: sumPaid(new Date(0).toISOString()),
      openInquiries: leads.filter((l) => l.status === "new" || l.status === "contacted").length,
      newInquiries: leads.filter((l) => l.status === "new").length,
    },
    revenueByMonth,
    signupsByMonth,
    assets: {
      models: rows.reduce((sum, r) => sum + r.models, 0),
      approved: rows.reduce((sum, r) => sum + r.approved, 0),
      buildsThisMonth: monthJobs.filter((j) => j.outcome !== "failed").length,
      buildsAllTime: jobs.filter((j) => j.outcome !== "failed").length,
      failedThisMonth: monthJobs.filter((j) => j.outcome === "failed").length,
      paidBuildsThisMonth: monthJobs.filter((j) => j.provider === "3daistudio").length,
      apiSpendThisMonth: monthJobs.reduce((sum, j) => sum + j.costMinor, 0),
      apiSpendAllTime: jobs.reduce((sum, j) => sum + j.costMinor, 0),
      buildsByMonth,
    },
    guests30: {
      scans: eventCount("scan"),
      menuViews: eventCount("menu_view"),
      dishViews: eventCount("dish_view"),
      arOpens: eventCount("ar_open"),
      orders: liveOrders.length,
      orderValue: liveOrders.reduce((sum, o) => sum + o.totalMinor, 0),
    },
    attention,
  };
}
