import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { listDishes, listEvents, listTableCodes } from "@/lib/db";
import { summarise } from "@/lib/analytics";
import { SERIES } from "@/lib/chart-palette";
import { BarList, Funnel, StatTile, TimeSeriesChart } from "@/components/app/charts";
import {
  Empty,
  Eyebrow,
  Lede,
  PageTitle,
  Panel,
  SectionTitle,
} from "@/components/app/ui";
import { cn, formatDuration } from "@/lib/utils";

export const metadata: Metadata = { title: "What guests look at · Dish360" };

const RANGES = [7, 30, 90] as const;

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const { restaurant } = await requireAuth();

  const days = RANGES.includes(Number(searchParams.days) as (typeof RANGES)[number])
    ? Number(searchParams.days)
    : 30;

  const [dishes, events, codes] = await Promise.all([
    listDishes(restaurant.id),
    listEvents(restaurant.id, days),
    listTableCodes(restaurant.id),
  ]);

  const summary = summarise(events, dishes, days);
  const labelForTable = new Map(codes.map((c) => [c.tableNumber ?? c.code, c.label]));

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>Last {days} days</Eyebrow>
          <PageTitle className="mt-2">What guests look at</PageTitle>
          <Lede className="mt-1.5 max-w-2xl">
            Every scan, dish and 3D view, counted against the table it came from.
          </Lede>
        </div>

        <div className="flex gap-1.5">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={`/dashboard/insights?days=${range}`}
              className={cn(
                "rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors",
                days === range
                  ? "bg-sage/[0.16] text-sage"
                  : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.1]",
              )}
            >
              {range} days
            </Link>
          ))}
        </div>
      </header>

      {events.length === 0 ? (
        <Empty
          icon={<BarChart3 className="h-5 w-5" />}
          title="Nothing recorded in this stretch"
          body="Numbers start the moment a guest scans a code. Print a stand and put it on your busiest table."
        />
      ) : (
        <>
          <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Scans"
              value={summary.scans.toLocaleString("en-IN")}
              delta={summary.scanTrendPct}
              hint={`against the ${Math.floor(days / 2)} days before`}
              spark={summary.series.slice(-12).map((d) => d.scans)}
            />
            <StatTile
              label="Opened a dish in 3D"
              value={`${(summary.arEngagementRate * 100).toFixed(0)}%`}
              hint={`${summary.arViews.toLocaleString("en-IN")} times, from ${summary.dishViews.toLocaleString("en-IN")} dishes opened`}
            />
            <StatTile
              label="Went on to order"
              value={`${(summary.conversionRate * 100).toFixed(0)}%`}
              hint={`${summary.orders.toLocaleString("en-IN")} orders from the dish`}
            />
            <StatTile
              label="Time spent looking"
              value={formatDuration(summary.avgArSeconds)}
              hint={`${formatDuration(summary.totalArSeconds)} altogether`}
            />
          </section>

          <Panel className="p-6">
            <SectionTitle>Day by day</SectionTitle>
            <Lede className="mb-5 mt-1 text-[12.5px]">
              Scans, 3D views and orders across the stretch.
            </Lede>
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
                {
                  key: "orders",
                  label: "Orders",
                  color: SERIES.tertiary,
                  values: summary.series.map((d) => d.orders),
                },
              ]}
              height={260}
            />
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="p-6">
              <SectionTitle>From the code to the order</SectionTitle>
              <Lede className="mb-5 mt-1 text-[12.5px]">
                Where guests stop along the way.
              </Lede>
              <Funnel
                stages={[
                  { id: "scan", label: "Scanned the code", value: summary.scans },
                  { id: "menu", label: "Opened the menu", value: summary.menuViews },
                  { id: "dish", label: "Opened a dish", value: summary.dishViews },
                  { id: "3d", label: "Looked at it in 3D", value: summary.arViews },
                  { id: "order", label: "Ordered it", value: summary.orders },
                ]}
              />
            </Panel>

            <Panel className="p-6">
              <SectionTitle>Busiest tables</SectionTitle>
              <Lede className="mb-5 mt-1 text-[12.5px]">
                A table on zero either has no stand on it, or has one nobody notices.
              </Lede>
              <BarList
                rows={summary.tables.slice(0, 10).map((t) => ({
                  id: t.tableNumber,
                  label: labelForTable.get(t.tableNumber) ?? `Table ${t.tableNumber}`,
                  value: t.scans,
                }))}
                emptyLabel="No scans tied to a table yet."
              />
            </Panel>
          </div>

          <Panel className="p-6">
            <SectionTitle>Dish by dish</SectionTitle>
            <Lede className="mb-5 mt-1 text-[12.5px]">
              A dish people keep opening but rarely order is priced wrong, described
              wrong, or the 3D is not doing it justice.
            </Lede>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {[
                      "Dish",
                      "Opened",
                      "In 3D",
                      "3D rate",
                      "Ordered",
                      "Order rate",
                      "Time on it",
                    ].map((heading, index) => (
                      <th
                        // Keyed by position: two columns could share a label.
                        key={index}
                        className={cn(
                          "pb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-dim",
                          index > 0 && "text-right",
                        )}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.topDishes.map((row) => (
                    <tr key={row.dishId} className="border-b border-white/[0.04]">
                      <td className="py-3 pr-4 text-[13px] font-medium text-ink">
                        <Link
                          href={`/dashboard/menu/${row.dishId}`}
                          className="hover:text-sage"
                        >
                          {row.name}
                        </Link>
                      </td>
                      {[
                        row.views.toLocaleString("en-IN"),
                        row.arViews.toLocaleString("en-IN"),
                        `${(row.arRate * 100).toFixed(0)}%`,
                        row.orders.toLocaleString("en-IN"),
                        `${(row.conversion * 100).toFixed(0)}%`,
                        formatDuration(row.avgArSeconds),
                      ].map((cell, index) => (
                        <td
                          key={index}
                          className="py-3 text-right text-[13px] tabular-nums text-ink-plain"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionTitle>What guests are holding</SectionTitle>
            <Lede className="mb-5 mt-1 text-[12.5px]">
              iPhones open it in Apple&apos;s own viewer, Android phones in
              Google&apos;s. A computer gets the 3D on the page instead of on a table.
            </Lede>
            <BarList
              rows={[
                { id: "iphone", label: "iPhone or iPad", value: summary.devices.iphone },
                { id: "android", label: "Android", value: summary.devices.android },
                { id: "computer", label: "A computer", value: summary.devices.computer },
                {
                  id: "unknown",
                  label: "Something else",
                  value: summary.devices.unknown,
                },
              ].filter((row) => row.value > 0)}
              emptyLabel="Nothing yet."
            />
          </Panel>
        </>
      )}
    </div>
  );
}
