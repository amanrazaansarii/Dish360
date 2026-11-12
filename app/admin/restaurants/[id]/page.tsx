import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { overview } from "@/lib/admin/metrics";
import { listAssetJobs, listPayments } from "@/lib/db";
import {
  actAsAction,
  deletePaymentAction,
  setPublishedAction,
  setSuspendedAction,
} from "@/app/admin/actions";
import { LiveTag, PageHead, SubTag, Table, money, shortDate } from "@/components/admin/bits";
import { DeleteRestaurantForm, PaymentForm, ResetLinkButton, SubscriptionForm } from "@/components/admin/forms";
import { requireAdmin } from "@/lib/auth/admin";
import { Button, Panel, SectionTitle, TimeAgo } from "@/components/app/ui";

export const metadata = { title: "Restaurant · Dish360 admin" };

const METHOD_WORDS = { upi: "UPI", bank: "Bank transfer", card: "Card", cash: "Cash", other: "Other" } as const;

export default async function AdminRestaurant({ params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  const o = await overview();
  const row = o.rows.find((r) => r.restaurant.id === params.id);
  if (!row) notFound();
  const r = row.restaurant;
  const cur = o.platform.currency;

  const [payments, jobs] = await Promise.all([
    listPayments(r.id),
    listAssetJobs({ restaurantId: r.id }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/restaurants" className="inline-flex items-center gap-1.5 text-[13px] text-ink-dim hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Restaurants
      </Link>

      <PageHead
        title={r.name}
        lede={[r.city, r.address].filter(Boolean).join(" · ") || "No address yet"}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/m/${r.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-white/[0.1]"
            >
              Their menu <ExternalLink className="h-3 w-3" />
            </Link>
            <form action={actAsAction}>
              <input type="hidden" name="restaurantId" value={r.id} />
              <Button type="submit">Open their dashboard</Button>
            </form>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <SubTag status={r.subscription.status} />
        <LiveTag restaurant={r} />
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Plan", row.plan.name, r.subscription.status === "comped" ? "On the house" : row.price === 0 ? "Free" : `${money(row.price, cur)} per ${r.subscription.interval}`],
          ["Paid in total", money(row.paidTotal, cur), row.lastPaymentAt ? `last ${shortDate(row.lastPaymentAt)}` : "nothing yet"],
          ["Menu", `${row.dishes} dishes`, `${row.models} in 3D · ${row.approved} approved · ${row.codes} codes`],
          ["Guests · 30 days", `${row.scans30} scans`, `${row.arOpens30} opened 3D · ${row.orders30} orders`],
        ].map(([label, value, hint]) => (
          <div key={label} className="rounded-2xl bg-surface-elevated px-5 py-4 ring-1 ring-inset ring-white/[0.07]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">{label}</p>
            <p className="mt-1.5 text-[20px] font-bold text-ink">{value}</p>
            <p className="mt-1 text-[11.5px] text-ink-dim">{hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionTitle>Plan and subscription</SectionTitle>
          <p className="mt-1.5 text-[13px] text-ink-plain">
            Changing the plan changes their limits at once. Started {shortDate(r.subscription.startedAt)}.
          </p>
          <div className="mt-5">
            <SubscriptionForm
              restaurantId={r.id}
              plan={r.plan}
              plans={o.platform.plans}
              subscription={r.subscription}
              currency={cur}
            />
          </div>
        </Panel>

        <Panel className="p-6">
          <SectionTitle>Record a payment</SectionTitle>
          <p className="mt-1.5 text-[13px] text-ink-plain">
            Money that reached you by UPI, transfer or cash. It counts toward revenue from the date received.
          </p>
          <div className="mt-5">
            <PaymentForm restaurantId={r.id} suggested={row.price} currency={cur} />
          </div>
        </Panel>
      </div>

      <Panel className="p-6">
        <SectionTitle>Payments</SectionTitle>
        {payments.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-dim">None recorded.</p>
        ) : (
          <div className="mt-4">
            <Table head={["Received", "Amount", "How", "Covers", "Reference", ""]}>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap text-ink">{shortDate(p.paidAt)}</td>
                  <td className="whitespace-nowrap font-semibold text-ink">{money(p.amountMinor, p.currency)}</td>
                  <td className="text-ink-plain">{METHOD_WORDS[p.method]}</td>
                  <td className="whitespace-nowrap text-ink-dim">
                    {p.periodStart ? `${shortDate(p.periodStart)} – ${shortDate(p.periodEnd)}` : "—"}
                  </td>
                  <td className="text-ink-dim">{[p.reference, p.note].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="text-right">
                    <form action={deletePaymentAction}>
                      <input type="hidden" name="paymentId" value={p.id} />
                      <input type="hidden" name="restaurantId" value={r.id} />
                      <button type="submit" className="text-[12px] text-ink-dim hover:text-red-300">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-6">
          <SectionTitle>People</SectionTitle>
          <ul className="mt-4 flex flex-col gap-5">
            {row.owners.map((u) => (
              <li key={u.id} className="flex flex-col gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{u.name}</p>
                  <p className="text-[12.5px] text-ink-plain">
                    <a href={`mailto:${u.email}`} className="hover:text-sage">{u.email}</a> · {u.role} · joined {shortDate(u.createdAt)}
                  </p>
                </div>
                <ResetLinkButton userId={u.id} />
              </li>
            ))}
          </ul>
          {r.phone ? <p className="mt-5 text-[13px] text-ink-plain">Restaurant phone: {r.phone}</p> : null}
        </Panel>

        <Panel className="p-6">
          <SectionTitle>Switches</SectionTitle>
          <div className="mt-4 flex flex-col gap-4">
            <form action={setPublishedAction} className="flex items-center justify-between gap-4">
              <input type="hidden" name="restaurantId" value={r.id} />
              <input type="hidden" name="published" value={r.published ? "0" : "1"} />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Published</p>
                <p className="text-[12.5px] text-ink-dim">{r.published ? "The menu is open to guests." : "Only the owner can see the menu."}</p>
              </div>
              <Button type="submit" variant="ghost" size="sm">
                {r.published ? "Unpublish" : "Publish"}
              </Button>
            </form>
            <form action={setSuspendedAction} className="flex items-center justify-between gap-4">
              <input type="hidden" name="restaurantId" value={r.id} />
              <input type="hidden" name="suspended" value={r.suspended ? "0" : "1"} />
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Suspended</p>
                <p className="text-[12.5px] text-ink-dim">
                  {r.suspended
                    ? "Guests see that the menu is closed; the owner sees why. Nothing is deleted."
                    : "Switch the menu off for guests (unpaid, abuse). Reversible."}
                </p>
              </div>
              <Button type="submit" variant={r.suspended ? "sage" : "danger"} size="sm">
                {r.suspended ? "Switch back on" : "Suspend"}
              </Button>
            </form>
            {r.id !== auth.user.restaurantId ? (
              <div className="border-t border-white/[0.06] pt-4">
                <p className="text-[13.5px] font-semibold text-ink">Delete</p>
                <div className="mt-2">
                  <DeleteRestaurantForm restaurantId={r.id} slug={r.slug} />
                </div>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>

      <Panel className="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <SectionTitle>3D builds</SectionTitle>
          <p className="text-[12.5px] text-ink-dim">
            {row.buildsThisMonth} this month
            {row.plan.monthlyBuildLimit !== null ? ` of ${row.plan.monthlyBuildLimit}` : ""} · API spend{" "}
            {money(row.apiSpend, o.platform.apiCostCurrency)}
          </p>
        </div>
        {jobs.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-dim">No builds yet.</p>
        ) : (
          <div className="mt-4">
            <Table head={["Dish", "Built by", "Outcome", "Cost", "When"]}>
              {jobs.slice(0, 25).map((j) => (
                <tr key={j.id}>
                  <td className="text-ink">{j.dishName}</td>
                  <td className="text-ink-plain">{j.provider === "3daistudio" ? "3D AI Studio" : "Built-in"}</td>
                  <td className="text-ink-plain">
                    {j.outcome === "fallback" ? "Fell back to built-in" : j.outcome === "failed" ? "Failed" : "Built"}
                  </td>
                  <td className="whitespace-nowrap text-ink-plain">{money(j.costMinor, j.costCurrency)}</td>
                  <td className="whitespace-nowrap text-ink-dim"><TimeAgo iso={j.createdAt} /></td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Panel>
    </div>
  );
}
