import type { AnalyticsEvent, Dish } from "@/lib/types";

/**
 * Pure aggregation over the raw event log. Kept separate from the repository so
 * the same functions work regardless of where events are stored.
 */

export interface DaySeries {
  date: string;
  label: string;
  scans: number;
  menuViews: number;
  dishViews: number;
  arViews: number;
  orders: number;
}

export interface DishPerformance {
  dishId: string;
  name: string;
  views: number;
  arViews: number;
  orders: number;
  /** 3D views ÷ dish views */
  arRate: number;
  /** orders ÷ 3D views */
  conversion: number;
  avgArSeconds: number;
}

export interface AnalyticsSummary {
  scans: number;
  menuViews: number;
  dishViews: number;
  arViews: number;
  orders: number;
  /** 3D views ÷ dish views, 0–1 */
  arEngagementRate: number;
  /** orders ÷ 3D views, 0–1 */
  conversionRate: number;
  avgArSeconds: number;
  totalArSeconds: number;
  devices: { iphone: number; android: number; computer: number; unknown: number };
  series: DaySeries[];
  topDishes: DishPerformance[];
  /** percentage change in scans, second half of the window vs the first */
  scanTrendPct: number;
  busiestHour: number | null;
  tables: { tableNumber: string; scans: number }[];
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

export function summarise(
  events: AnalyticsEvent[],
  dishes: Dish[],
  windowDays: number,
): AnalyticsSummary {
  const dishNames = new Map(dishes.map((d) => [d.id, d.name]));

  const buckets = new Map<string, DaySeries>();
  for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: date.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      scans: 0,
      menuViews: 0,
      dishViews: 0,
      arViews: 0,
      orders: 0,
    });
  }

  const summary: AnalyticsSummary = {
    scans: 0,
    menuViews: 0,
    dishViews: 0,
    arViews: 0,
    orders: 0,
    arEngagementRate: 0,
    conversionRate: 0,
    avgArSeconds: 0,
    totalArSeconds: 0,
    devices: { iphone: 0, android: 0, computer: 0, unknown: 0 },
    series: [],
    topDishes: [],
    scanTrendPct: 0,
    busiestHour: null,
    tables: [],
  };

  const perDish = new Map<
    string,
    { views: number; ar: number; orders: number; seconds: number; sessions: number }
  >();
  const perTable = new Map<string, number>();
  const perHour = new Array<number>(24).fill(0);
  let arSessionCount = 0;

  const touchDish = (id: string) => {
    let row = perDish.get(id);
    if (!row) {
      row = { views: 0, ar: 0, orders: 0, seconds: 0, sessions: 0 };
      perDish.set(id, row);
    }
    return row;
  };

  for (const event of events) {
    const bucket = buckets.get(dayKey(event.createdAt));

    switch (event.kind) {
      case "scan": {
        summary.scans += 1;
        summary.devices[event.device] += 1;
        if (bucket) bucket.scans += 1;
        perHour[new Date(event.createdAt).getHours()] += 1;
        if (event.tableNumber) {
          perTable.set(event.tableNumber, (perTable.get(event.tableNumber) ?? 0) + 1);
        }
        break;
      }
      case "menu_view": {
        summary.menuViews += 1;
        if (bucket) bucket.menuViews += 1;
        break;
      }
      case "dish_view": {
        summary.dishViews += 1;
        if (bucket) bucket.dishViews += 1;
        if (event.dishId) touchDish(event.dishId).views += 1;
        break;
      }
      case "ar_open": {
        summary.arViews += 1;
        if (bucket) bucket.arViews += 1;
        if (event.dishId) touchDish(event.dishId).ar += 1;
        break;
      }
      case "ar_close": {
        const seconds = event.seconds ?? 0;
        summary.totalArSeconds += seconds;
        arSessionCount += 1;
        if (event.dishId) {
          const row = touchDish(event.dishId);
          row.seconds += seconds;
          row.sessions += 1;
        }
        break;
      }
      case "order": {
        summary.orders += 1;
        if (bucket) bucket.orders += 1;
        if (event.dishId) touchDish(event.dishId).orders += 1;
        break;
      }
      default:
        break;
    }
  }

  summary.series = Array.from(buckets.values());
  summary.arEngagementRate = ratio(summary.arViews, summary.dishViews);
  summary.conversionRate = ratio(summary.orders, summary.arViews);
  summary.avgArSeconds = arSessionCount === 0 ? 0 : summary.totalArSeconds / arSessionCount;

  summary.topDishes = Array.from(perDish.entries())
    .map(([dishId, row]): DishPerformance => ({
      dishId,
      name: dishNames.get(dishId) ?? "Removed dish",
      views: row.views,
      arViews: row.ar,
      orders: row.orders,
      arRate: ratio(row.ar, row.views),
      conversion: ratio(row.orders, row.ar),
      avgArSeconds: row.sessions === 0 ? 0 : row.seconds / row.sessions,
    }))
    .sort((a, b) => b.views - a.views);

  const half = Math.floor(summary.series.length / 2);
  if (half > 0) {
    const first = summary.series.slice(0, half).reduce((s, d) => s + d.scans, 0);
    const second = summary.series.slice(half).reduce((s, d) => s + d.scans, 0);
    summary.scanTrendPct = first === 0 ? (second > 0 ? 100 : 0) : ((second - first) / first) * 100;
  }

  const peak = perHour.reduce(
    (best, count, hour) => (count > best.count ? { hour, count } : best),
    { hour: -1, count: 0 },
  );
  summary.busiestHour = peak.count > 0 ? peak.hour : null;

  summary.tables = Array.from(perTable.entries())
    .map(([tableNumber, scans]) => ({ tableNumber, scans }))
    .sort((a, b) => b.scans - a.scans);

  return summary;
}

/**
 * Print-vs-AR return on investment.
 *
 * Reprint cost is the recurring spend Dish360 removes; the uplift is the extra
 * revenue from a measured increase in average order value. Both inputs come
 * from the operator, so the numbers on screen are theirs, not ours.
 */
export interface RoiInputs {
  covers: number;
  avgOrderMinor: number;
  reprintsPerYear: number;
  reprintCostMinor: number;
  upliftPct: number;
  planCostMinor: number;
}

export interface RoiResult {
  annualRevenueMinor: number;
  upliftRevenueMinor: number;
  printSavingMinor: number;
  planCostAnnualMinor: number;
  netGainMinor: number;
  roiMultiple: number;
  paybackDays: number | null;
}

export function computeRoi(input: RoiInputs): RoiResult {
  const annualRevenueMinor = input.covers * input.avgOrderMinor * 365;
  const upliftRevenueMinor = Math.round(annualRevenueMinor * (input.upliftPct / 100));
  const printSavingMinor = input.reprintsPerYear * input.reprintCostMinor;
  const planCostAnnualMinor = input.planCostMinor * 12;
  const netGainMinor = upliftRevenueMinor + printSavingMinor - planCostAnnualMinor;
  const roiMultiple =
    planCostAnnualMinor === 0
      ? 0
      : (upliftRevenueMinor + printSavingMinor) / planCostAnnualMinor;

  const dailyGain = (upliftRevenueMinor + printSavingMinor) / 365;
  const paybackDays =
    dailyGain <= 0 ? null : Math.max(1, Math.ceil(planCostAnnualMinor / dailyGain));

  return {
    annualRevenueMinor,
    upliftRevenueMinor,
    printSavingMinor,
    planCostAnnualMinor,
    netGainMinor,
    roiMultiple,
    paybackDays,
  };
}
