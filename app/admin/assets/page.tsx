import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { overview } from "@/lib/admin/metrics";
import { activeProvider } from "@/lib/ar/pipeline";
import { Kpi, MonthBars, PageHead, Table, money } from "@/components/admin/bits";
import { Panel, SectionTitle, Tag, TimeAgo } from "@/components/app/ui";

export const metadata = { title: "3D & API costs · Dish360 admin" };

export default async function AdminAssets() {
  await requireAdmin("/admin/assets");
  const o = await overview();
  const api = o.platform.apiCostCurrency;
  const names = new Map(o.rows.map((r) => [r.restaurant.id, r.restaurant.name]));
  const paidLive = activeProvider() === "3daistudio";

  const heaviest = [...o.rows]
    .filter((r) => r.builds > 0)
    .sort((a, b) => b.buildsThisMonth - a.buildsThisMonth || b.builds - a.builds);

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="3D & API costs"
        lede="Every 3D model built on Dish360, who built it, which service made it and what it cost you."
        action={
          <Tag tone={paidLive ? "sage" : "amber"}>
            {paidLive ? "3D AI Studio connected" : "Built-in builder · no API key yet"}
          </Tag>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Models live" value={String(o.assets.models)} hint={`${o.assets.approved} approved for guests`} />
        <Kpi label="Builds this month" value={String(o.assets.buildsThisMonth)} hint={`${o.assets.paidBuildsThisMonth} through the paid service`} />
        <Kpi label="API spend this month" value={money(o.assets.apiSpendThisMonth, api)} hint={`at ${money(o.platform.apiCostPerBuildMinor, api)} a model`} />
        <Kpi label="API spend all time" value={money(o.assets.apiSpendAllTime, api)} hint={`${o.assets.buildsAllTime} builds · ${o.assets.failedThisMonth} failed this month`} />
      </section>

      {o.platform.apiCostPerBuildMinor === 0 ? (
        <p className="rounded-xl bg-amber-400/[0.1] px-4 py-3 text-[13px] text-amber-100">
          The price per model is not set, so paid builds are costed at zero.{" "}
          <Link href="/admin/pricing" className="font-semibold underline">Set it under Plans &amp; pricing</Link>{" "}
          once the 3D AI Studio account is in place.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionTitle>Builds, by month</SectionTitle>
          <div className="mt-5">
            <MonthBars months={o.assets.buildsByMonth} format={(v) => String(v)} />
          </div>
        </Panel>
        <Panel className="p-6">
          <SectionTitle>Who builds the most</SectionTitle>
          {heaviest.length === 0 ? (
            <p className="mt-4 text-[13px] text-ink-dim">No builds yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col divide-y divide-white/[0.05]">
              {heaviest.slice(0, 8).map((r) => (
                <li key={r.restaurant.id} className="flex items-center justify-between gap-3 py-3 text-[13.5px]">
                  <Link href={`/admin/restaurants/${r.restaurant.id}`} className="truncate text-ink hover:text-sage">
                    {r.restaurant.name}
                  </Link>
                  <span className="whitespace-nowrap text-ink-plain">
                    {r.buildsThisMonth}
                    {r.plan.monthlyBuildLimit !== null ? `/${r.plan.monthlyBuildLimit}` : ""} this month · {r.builds} total ·{" "}
                    {money(r.apiSpend, api)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel className="p-6">
        <SectionTitle>Build log</SectionTitle>
        <div className="mt-4">
          {o.jobs.length === 0 ? (
            <p className="text-[13px] text-ink-dim">Nothing built yet.</p>
          ) : (
            <Table head={["When", "Restaurant", "Dish", "Built by", "Outcome", "Time", "Cost"]}>
              {o.jobs.slice(0, 100).map((j) => (
                <tr key={j.id}>
                  <td className="whitespace-nowrap text-ink-dim"><TimeAgo iso={j.createdAt} /></td>
                  <td>
                    <Link href={`/admin/restaurants/${j.restaurantId}`} className="text-ink hover:text-sage">
                      {names.get(j.restaurantId) ?? "Removed"}
                    </Link>
                  </td>
                  <td className="text-ink-plain">{j.dishName}</td>
                  <td className="text-ink-plain">{j.provider === "3daistudio" ? "3D AI Studio" : "Built-in"}</td>
                  <td>
                    {j.outcome === "failed" ? (
                      <Tag tone="danger">Failed</Tag>
                    ) : j.outcome === "fallback" ? (
                      <Tag tone="amber">Fell back</Tag>
                    ) : (
                      <Tag tone="sage">Built</Tag>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-ink-dim">{j.milliseconds ? `${(j.milliseconds / 1000).toFixed(1)}s` : "—"}</td>
                  <td className="whitespace-nowrap text-ink-plain">{money(j.costMinor, j.costCurrency)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Panel>
    </div>
  );
}
