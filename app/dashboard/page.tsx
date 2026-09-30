import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  CircleCheck,
  Plus,
  QrCode,
  Receipt,
  Sparkles,
} from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { listDishes, listEvents, listOrders, listTableCodes } from "@/lib/db";
import { summarise } from "@/lib/analytics";
import { awaitingApproval, isLiveInAr } from "@/lib/dish";
import { getPlan } from "@/lib/plans";
import { SERIES } from "@/lib/chart-palette";
import { BarList, StatTile, TimeSeriesChart } from "@/components/app/charts";
import {
  ButtonLink,
  Empty,
  Eyebrow,
  Lede,
  PageTitle,
  Panel,
  SectionTitle,
  Tag,
  Well,
} from "@/components/app/ui";
import { formatMoney, formatRelativeTime } from "@/lib/utils";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Today · Dish360" };

/**
 * Reading the clock is request-time data, so it is kept out of the component
 * body rather than done inline during render.
 */
function takenToday(orders: Order[]): number {
  const since = Date.now() - 86400000;
  return orders
    .filter((o) => o.status !== "cancelled" && Date.parse(o.createdAt) > since)
    .reduce((sum, o) => sum + o.totalMinor, 0);
}

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { new?: string };
}) {
  const { restaurant } = await requireAuth();

  const [dishes, codes, orders, events] = await Promise.all([
    listDishes(restaurant.id),
    listTableCodes(restaurant.id),
    listOrders(restaurant.id),
    listEvents(restaurant.id, 30),
  ]);

  const summary = summarise(events, dishes, 30);
  const plan = getPlan(restaurant.plan);

  const needsApproval = dishes.filter(awaitingApproval);
  const liveIn3d = dishes.filter(isLiveInAr);
  const newOrders = orders.filter((o) => o.status === "new");

  // The five steps from the home page, in the same order.
  const steps = [
    {
      done: dishes.length > 0,
      label: "Add a dish",
      href: "/dashboard/menu/new",
    },
    {
      done: liveIn3d.length > 0,
      label: "Check its 3D and release it",
      href: dishes[0] ? `/dashboard/menu/${dishes[0].id}` : "/dashboard/menu",
    },
    { done: codes.length > 0, label: "Print a table code", href: "/dashboard/codes" },
    {
      done: restaurant.published,
      label: "Publish your menu",
      href: "/dashboard/settings",
    },
  ];
  const todo = steps.filter((s) => !s.done);

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>Last 30 days</Eyebrow>
          <PageTitle className="mt-2">
            {searchParams.new ? `Welcome, ${restaurant.name}` : restaurant.name}
          </PageTitle>
          <Lede className="mt-1.5">
            {restaurant.published ? (
              <>
                Your menu is live at{" "}
                <Link
                  href={`/m/${restaurant.slug}`}
                  target="_blank"
                  className="font-medium text-sage hover:underline"
                >
                  /m/{restaurant.slug}
                </Link>
              </>
            ) : (
              "Your menu is not published yet, so nobody can see it."
            )}
          </Lede>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <ButtonLink href="/dashboard/menu/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add a dish
          </ButtonLink>
          <ButtonLink href="/dashboard/codes" size="sm" variant="ghost">
            <QrCode className="h-3.5 w-3.5" />
            Table codes
          </ButtonLink>
        </div>
      </header>

      {/* ------------------------------------------- things waiting on you --- */}
      {needsApproval.length > 0 ? (
        <Panel className="border-l-2 border-l-sage p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <SectionTitle className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-sage" />
                {needsApproval.length === 1
                  ? "One dish is ready for you to check"
                  : `${needsApproval.length} dishes are ready for you to check`}
              </SectionTitle>
              <Lede className="mt-1.5 max-w-xl">
                The 3D is built. Have a look at it, and release it when you are happy —
                until then no guest sees it.
              </Lede>
            </div>
          </div>

          <ul className="mt-5 flex flex-wrap gap-2">
            {needsApproval.map((dish) => (
              <li key={dish.id}>
                <Link
                  href={`/dashboard/menu/${dish.id}#three-d`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
                >
                  {dish.name}
                  <ArrowRight className="h-3.5 w-3.5 text-sage" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {todo.length > 0 ? (
        <Panel className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle>
              {steps.length - todo.length} of {steps.length} set up
            </SectionTitle>
            <Tag tone="amber">{todo.length} to go</Tag>
          </div>
          <ol className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3.5 py-3 ring-1 ring-inset ring-white/[0.06] transition-colors hover:bg-white/[0.06]"
                >
                  {step.done ? (
                    <CircleCheck className="h-4 w-4 shrink-0 text-sage" />
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-inset ring-white/20" />
                  )}
                  <span
                    className={
                      step.done
                        ? "text-[13px] text-ink-dim line-through"
                        : "text-[13px] font-medium text-ink"
                    }
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </Panel>
      ) : null}

      {/* ------------------------------------------------------- the numbers --- */}
      <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Scans"
          value={summary.scans.toLocaleString("en-IN")}
          delta={summary.scanTrendPct}
          hint="against the 15 days before"
          spark={summary.series.slice(-12).map((d) => d.scans)}
        />
        <StatTile
          label="Looked at in 3D"
          value={summary.arViews.toLocaleString("en-IN")}
          hint={`${(summary.arEngagementRate * 100).toFixed(0)}% of the dishes guests opened`}
          spark={summary.series.slice(-12).map((d) => d.arViews)}
        />
        <StatTile
          label="Ordered from the dish"
          value={summary.orders.toLocaleString("en-IN")}
          hint={`${(summary.conversionRate * 100).toFixed(0)}% of 3D views`}
          spark={summary.series.slice(-12).map((d) => d.orders)}
        />
        <StatTile
          label="Taken today"
          value={formatMoney(takenToday(orders), restaurant.currency)}
          hint={`${newOrders.length} order${newOrders.length === 1 ? "" : "s"} waiting`}
        />
      </section>

      <Panel className="p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionTitle>Scans and 3D views</SectionTitle>
            <Lede className="mt-1 text-[12.5px]">
              Every day, across all your table codes.
            </Lede>
          </div>
          <Link
            href="/dashboard/insights"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sage hover:underline"
          >
            The full picture
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {summary.scans === 0 ? (
          <Empty
            icon={<QrCode className="h-5 w-5" />}
            title="No scans yet"
            body="As soon as a guest scans a table code, the daily counts start showing here."
          />
        ) : (
          <TimeSeriesChart
            labels={summary.series.map((d) => d.label)}
            series={[
              {
                key: "scans",
                label: "Scans",
                color: SERIES.primary,
                values: summary.series.map((d) => d.scans),
              },
              {
                key: "views",
                label: "3D views",
                color: SERIES.secondary,
                values: summary.series.map((d) => d.arViews),
              },
            ]}
          />
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <SectionTitle>Looked at most</SectionTitle>
            <Link
              href="/dashboard/insights"
              className="text-[12.5px] font-medium text-ink-dim hover:text-ink"
            >
              Every dish
            </Link>
          </div>
          <BarList
            rows={summary.topDishes.slice(0, 6).map((d) => ({
              id: d.dishId,
              label: d.name,
              value: d.views,
              hint: `${d.arViews} in 3D · ${d.orders} ordered`,
            }))}
            emptyLabel="Nothing yet."
          />
        </Panel>

        <Panel className="p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <SectionTitle>Orders waiting</SectionTitle>
            <Link
              href="/dashboard/orders"
              className="text-[12.5px] font-medium text-ink-dim hover:text-ink"
            >
              All orders
            </Link>
          </div>

          {newOrders.length === 0 ? (
            <Empty
              icon={<Receipt className="h-5 w-5" />}
              title="Nothing waiting"
              body="When a guest orders from a dish they are looking at, it turns up here."
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {newOrders.slice(0, 5).map((order) => (
                <li key={order.id}>
                  <Well className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-ink">
                          Table {order.tableNumber ?? "—"}
                        </p>
                        <p className="mt-0.5 truncate text-[12.5px] text-ink-plain">
                          {order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13.5px] font-bold tabular-nums text-sage">
                          {formatMoney(order.totalMinor, order.currency)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-dim">
                          {formatRelativeTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Well>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ------------------------------------------------------------- plan --- */}
      <Panel className="p-6">
        <SectionTitle>Your plan</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Usage
            label="Dishes"
            used={dishes.length}
            limit={plan.dishLimit}
            hint={`${liveIn3d.length} of them in 3D`}
          />
          <Usage label="Table codes" used={codes.length} limit={plan.tableCodeLimit} />
          <Well className="px-4 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
              Plan
            </p>
            <p className="mt-1.5 text-lg font-bold text-ink">{plan.name}</p>
            <Link
              href="/dashboard/settings#plan"
              className="mt-1.5 inline-block text-[12.5px] font-medium text-sage hover:underline"
            >
              What it covers
            </Link>
          </Well>
        </div>

        {dishes.length > 0 && liveIn3d.length < dishes.length ? (
          <p className="mt-4 flex items-start gap-2 text-[12.5px] text-ink-plain">
            <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-dim" />
            <span>
              {dishes.length - liveIn3d.length} dish
              {dishes.length - liveIn3d.length === 1 ? "" : "es"} on your menu can&apos;t
              be seen in 3D yet.{" "}
              <Link href="/dashboard/menu" className="font-medium text-sage hover:underline">
                Go through the menu
              </Link>
            </span>
          </p>
        ) : null}
      </Panel>
    </div>
  );
}

function Usage({
  label,
  used,
  limit,
  hint,
}: {
  label: string;
  used: number;
  limit: number | null;
  hint?: string;
}) {
  const share = limit === null ? 0 : Math.min(1, used / limit);
  const close = limit !== null && share >= 0.8;

  return (
    <Well className="px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
        {label}
      </p>
      <p className="mt-1.5 text-lg font-bold text-ink">
        {used}
        <span className="text-[13px] font-medium text-ink-dim">
          {limit === null ? " · no limit" : ` of ${limit}`}
        </span>
      </p>
      {limit !== null ? (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <span
            className="block h-full rounded-r-[3px]"
            style={{
              width: `${Math.max(2, share * 100)}%`,
              background: close ? "#c47a2e" : SERIES.primary,
            }}
          />
        </div>
      ) : null}
      {hint ? <p className="mt-1.5 text-[11px] text-ink-dim">{hint}</p> : null}
      {close ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-200">
          <Check className="h-3 w-3" />
          Close to your plan&apos;s limit
        </p>
      ) : null}
    </Well>
  );
}
