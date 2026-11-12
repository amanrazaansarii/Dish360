import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { overview } from "@/lib/admin/metrics";
import { LiveTag, PageHead, SubTag, Table, money, shortDate } from "@/components/admin/bits";
import { FIELD, Panel } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Restaurants · Dish360 admin" };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "paying", label: "Paying" },
  { id: "trial", label: "Trial" },
  { id: "late", label: "Late" },
  { id: "free", label: "Free plan" },
  { id: "unpublished", label: "Not published" },
  { id: "suspended", label: "Suspended" },
] as const;

export default async function AdminRestaurants({
  searchParams,
}: {
  searchParams: { q?: string; show?: string };
}) {
  await requireAdmin("/admin/restaurants");
  const o = await overview();
  const cur = o.platform.currency;
  const q = (searchParams.q ?? "").trim().toLowerCase();
  const show = searchParams.show ?? "all";

  const rows = o.rows
    .filter((r) => {
      const x = r.restaurant;
      if (q) {
        const hay = [x.name, x.city, x.slug, ...r.owners.map((u) => `${u.name} ${u.email}`)].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      switch (show) {
        case "paying": return r.mrr > 0;
        case "trial": return x.subscription.status === "trial";
        case "late": return x.subscription.status === "past_due";
        case "free": return x.plan === "free";
        case "unpublished": return !x.published;
        case "suspended": return x.suspended;
        default: return true;
      }
    })
    .sort((a, b) => b.restaurant.createdAt.localeCompare(a.restaurant.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <PageHead title="Restaurants" lede={`${o.totals.restaurants} signed up · ${o.totals.live} live · ${o.totals.paying} paying.`} />

      <Panel className="p-5">
        <form className="flex flex-wrap items-center gap-3" action="/admin/restaurants">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search by name, city, owner or email"
            aria-label="Search restaurants"
            className={cn(FIELD, "max-w-sm py-2.5")}
          />
          <input type="hidden" name="show" value={show} />
          <button type="submit" className="rounded-full bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-white/[0.1]">
            Search
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              href={`/admin/restaurants?show=${f.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                show === f.id ? "bg-sage text-charcoal" : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.08]",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-ink-dim">No restaurants match.</p>
        ) : (
          <Table head={["Restaurant", "Plan", "Billing", "Menu", "Guests · 30d", "Paid in", "Joined"]}>
            {rows.map((r) => (
              <tr key={r.restaurant.id}>
                <td>
                  <Link href={`/admin/restaurants/${r.restaurant.id}`} className="font-semibold text-ink hover:text-sage">
                    {r.restaurant.name}
                  </Link>
                  <p className="text-[12px] text-ink-dim">
                    {[r.restaurant.city, r.owners[0]?.email].filter(Boolean).join(" · ")}
                  </p>
                </td>
                <td className="whitespace-nowrap">
                  <p className="text-ink">{r.plan.name}</p>
                  <p className="text-[12px] text-ink-dim">
                    {r.price === 0 ? "Free" : `${money(r.price, cur)}/${r.restaurant.subscription.interval === "year" ? "yr" : "mo"}`}
                  </p>
                </td>
                <td className="whitespace-nowrap">
                  <SubTag status={r.restaurant.subscription.status} />
                  {r.restaurant.subscription.renewsAt ? (
                    <p className="mt-1 text-[12px] text-ink-dim">due {shortDate(r.restaurant.subscription.renewsAt)}</p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap">
                  <LiveTag restaurant={r.restaurant} />
                  <p className="mt-1 text-[12px] text-ink-dim">
                    {r.dishes} dishes · {r.models} in 3D · {r.codes} codes
                  </p>
                </td>
                <td className="whitespace-nowrap text-ink-plain">
                  {r.scans30} scans · {r.arOpens30} 3D
                  <p className="text-[12px] text-ink-dim">{r.orders30} orders</p>
                </td>
                <td className="whitespace-nowrap text-ink-plain">{money(r.paidTotal, cur)}</td>
                <td className="whitespace-nowrap text-ink-dim">{shortDate(r.restaurant.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
