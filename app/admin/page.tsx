import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { overview } from "@/lib/admin/metrics";
import { Kpi, LeadTag, MonthBars, PageHead, SOURCE_WORDS, SubTag, money, shortDate } from "@/components/admin/bits";
import { Panel, SectionTitle, TimeAgo } from "@/components/app/ui";
import { formatCompact } from "@/lib/utils";

export default async function AdminOverview() {
  await requireAdmin("/admin");
  const o = await overview();
  const cur = o.platform.currency;
  const api = o.platform.apiCostCurrency;
  const change =
    o.totals.revenueLastMonth > 0
      ? Math.round(((o.totals.revenueThisMonth - o.totals.revenueLastMonth) / o.totals.revenueLastMonth) * 100)
      : null;

  return (
    <div className="flex flex-col gap-7">
      <PageHead title="Overview" lede="Every restaurant on Dish360, what they pay, what they use, and what needs you." />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Monthly recurring" value={money(o.totals.mrr, cur)} hint={`${money(o.totals.arr, cur)} a year · ${o.totals.paying} paying`} href="/admin/billing" />
        <Kpi
          label="Received this month"
          value={money(o.totals.revenueThisMonth, cur)}
          hint={change === null ? `${money(o.totals.revenueAllTime, cur)} all time` : `${change >= 0 ? "+" : ""}${change}% on last month`}
          href="/admin/billing"
        />
        <Kpi label="Restaurants" value={String(o.totals.restaurants)} hint={`${o.totals.live} live · ${o.totals.newThisMonth} new this month`} href="/admin/restaurants" />
        <Kpi
          label="Open inquiries"
          value={String(o.totals.openInquiries)}
          hint={`${o.totals.newInquiries} not answered yet`}
          href="/admin/inquiries"
          tone={o.totals.newInquiries > 0 ? "warn" : undefined}
        />
        <Kpi label="3D models" value={String(o.assets.models)} hint={`${o.assets.approved} approved for guests`} href="/admin/assets" />
        <Kpi label="3D builds this month" value={String(o.assets.buildsThisMonth)} hint={`${o.assets.buildsAllTime} all time · ${o.assets.failedThisMonth} failed`} href="/admin/assets" />
        <Kpi label="API spend this month" value={money(o.assets.apiSpendThisMonth, api)} hint={`${money(o.assets.apiSpendAllTime, api)} all time`} href="/admin/assets" />
        <Kpi label="Guest scans · 30 days" value={formatCompact(o.guests30.scans)} hint={`${formatCompact(o.guests30.arOpens)} opened 3D · ${o.guests30.orders} orders`} />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionTitle>Money received, by month</SectionTitle>
          <div className="mt-5">
            <MonthBars months={o.revenueByMonth} format={(v) => money(v, cur)} empty="No payments recorded yet. Record them on a restaurant's page." />
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionTitle>New restaurants, by month</SectionTitle>
          <div className="mt-5">
            <MonthBars months={o.signupsByMonth} format={(v) => String(v)} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Needs you</SectionTitle>
            <span className="text-[12px] text-ink-dim">trials ending, payments due or late</span>
          </div>
          {o.attention.length === 0 ? (
            <p className="mt-4 text-[13px] text-ink-dim">Nothing due in the next week.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/[0.05]">
              {o.attention.slice(0, 8).map(({ row, why, when }) => (
                <li key={row.restaurant.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/restaurants/${row.restaurant.id}`} className="truncate text-[13.5px] font-semibold text-ink hover:text-sage">
                      {row.restaurant.name}
                    </Link>
                    <p className="text-[12px] text-ink-dim">
                      {why} · {shortDate(when)} · {money(row.price, cur)}
                    </p>
                  </div>
                  <SubTag status={row.restaurant.subscription.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Latest inquiries</SectionTitle>
            <Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-sage hover:underline">
              All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {o.leads.length === 0 ? (
            <p className="mt-4 text-[13px] text-ink-dim">
              None yet. Demo requests from the home page and plan-change requests from owners land here.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/[0.05]">
              {o.leads.slice(0, 6).map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-semibold text-ink">
                      {lead.restaurantName || lead.name}
                    </p>
                    <p className="truncate text-[12px] text-ink-dim">
                      {SOURCE_WORDS[lead.source]} · {lead.name} · <TimeAgo iso={lead.createdAt} />
                    </p>
                  </div>
                  <LeadTag status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="p-6">
        <SectionTitle>Guests, last 30 days, across every restaurant</SectionTitle>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Scans", formatCompact(o.guests30.scans)],
            ["Menu views", formatCompact(o.guests30.menuViews)],
            ["Dish views", formatCompact(o.guests30.dishViews)],
            ["Opened in 3D", formatCompact(o.guests30.arOpens)],
            ["Orders", String(o.guests30.orders)],
            ["Order value", money(o.guests30.orderValue, cur)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-dim">{label}</dt>
              <dd className="mt-1 text-[20px] font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
