import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { overview } from "@/lib/admin/metrics";
import { Kpi, MonthBars, PageHead, SubTag, Table, money, shortDate } from "@/components/admin/bits";
import { Panel, SectionTitle } from "@/components/app/ui";

export const metadata = { title: "Revenue & billing · Dish360 admin" };

const METHOD_WORDS = { upi: "UPI", bank: "Bank transfer", card: "Card", cash: "Cash", other: "Other" } as const;

export default async function AdminBilling() {
  await requireAdmin("/admin/billing");
  const o = await overview();
  const cur = o.platform.currency;
  const names = new Map(o.rows.map((r) => [r.restaurant.id, r.restaurant.name]));

  const subscribers = o.rows
    .filter((r) => r.restaurant.subscription.status !== "cancelled" && (r.price > 0 || r.restaurant.subscription.status !== "active"))
    .sort((a, b) => (a.restaurant.subscription.renewsAt ?? "9999").localeCompare(b.restaurant.subscription.renewsAt ?? "9999"));

  const byPlan = o.platform.plans.map((plan) => {
    const on = o.rows.filter((r) => r.restaurant.plan === plan.id);
    return { plan, count: on.length, mrr: on.reduce((sum, r) => sum + r.mrr, 0) };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="Revenue & billing"
        lede="Revenue is what you have recorded as received. Monthly recurring is what active subscriptions are priced at, with yearly plans spread over twelve months."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Monthly recurring" value={money(o.totals.mrr, cur)} hint={`${o.totals.paying} paying ${o.totals.paying === 1 ? "restaurant" : "restaurants"}`} />
        <Kpi label="Yearly run rate" value={money(o.totals.arr, cur)} />
        <Kpi label="Received this month" value={money(o.totals.revenueThisMonth, cur)} hint={`last month ${money(o.totals.revenueLastMonth, cur)}`} />
        <Kpi label="Received all time" value={money(o.totals.revenueAllTime, cur)} hint={`${o.payments.length} ${o.payments.length === 1 ? "payment" : "payments"}`} />
        <Kpi label="On trial" value={String(o.totals.trials)} />
        <Kpi label="Payment late" value={String(o.totals.pastDue)} tone={o.totals.pastDue > 0 ? "warn" : undefined} />
        <Kpi label="On the house" value={String(o.totals.comped)} />
        <Kpi label="Suspended" value={String(o.totals.suspended)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Panel className="p-6">
          <SectionTitle>Received, by month</SectionTitle>
          <div className="mt-5">
            <MonthBars months={o.revenueByMonth} format={(v) => money(v, cur)} empty="No payments recorded yet." />
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionTitle>By plan</SectionTitle>
          <ul className="mt-4 flex flex-col divide-y divide-white/[0.05]">
            {byPlan.map(({ plan, count, mrr }) => (
              <li key={plan.id} className="flex items-center justify-between py-3 text-[13.5px]">
                <span className="text-ink">
                  {plan.name} <span className="text-ink-dim">· {count}</span>
                </span>
                <span className="font-semibold text-ink">{money(mrr, cur)}/mo</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/pricing" className="mt-3 inline-block text-[12.5px] font-semibold text-sage hover:underline">
            Change the prices
          </Link>
        </Panel>
      </div>

      <Panel className="p-6">
        <SectionTitle>Subscriptions</SectionTitle>
        <p className="mt-1 text-[12.5px] text-ink-dim">Everyone who pays, is on trial, is late, or is on the house. Soonest due first.</p>
        <div className="mt-4">
          {subscribers.length === 0 ? (
            <p className="text-[13px] text-ink-dim">Nobody yet.</p>
          ) : (
            <Table head={["Restaurant", "Plan", "Status", "Price", "Next due", "Paid in"]}>
              {subscribers.map((r) => (
                <tr key={r.restaurant.id}>
                  <td>
                    <Link href={`/admin/restaurants/${r.restaurant.id}`} className="font-semibold text-ink hover:text-sage">
                      {r.restaurant.name}
                    </Link>
                  </td>
                  <td className="text-ink-plain">{r.plan.name}</td>
                  <td><SubTag status={r.restaurant.subscription.status} /></td>
                  <td className="whitespace-nowrap text-ink-plain">
                    {r.price === 0 ? "Free" : `${money(r.price, cur)}/${r.restaurant.subscription.interval === "year" ? "yr" : "mo"}`}
                    {r.restaurant.subscription.customPriceMinor !== null ? <span className="text-ink-dim"> · own price</span> : null}
                  </td>
                  <td className="whitespace-nowrap text-ink-plain">{shortDate(r.restaurant.subscription.renewsAt)}</td>
                  <td className="whitespace-nowrap text-ink-plain">{money(r.paidTotal, cur)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle>Every payment</SectionTitle>
        <div className="mt-4">
          {o.payments.length === 0 ? (
            <p className="text-[13px] text-ink-dim">
              None yet. Open a restaurant and use “Record a payment” when money arrives.
            </p>
          ) : (
            <Table head={["Received", "Restaurant", "Amount", "How", "Reference"]}>
              {o.payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap text-ink">{shortDate(p.paidAt)}</td>
                  <td>
                    <Link href={`/admin/restaurants/${p.restaurantId}`} className="text-ink hover:text-sage">
                      {names.get(p.restaurantId) ?? "Removed restaurant"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap font-semibold text-ink">{money(p.amountMinor, p.currency)}</td>
                  <td className="text-ink-plain">{METHOD_WORDS[p.method]}</td>
                  <td className="text-ink-dim">{p.reference || "—"}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Panel>
    </div>
  );
}
