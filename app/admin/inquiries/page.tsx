import { requireAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import { listLeads, listRestaurants } from "@/lib/db";
import { settings } from "@/lib/platform";
import { planFrom } from "@/lib/plans";
import { applyRequestedPlanAction, deleteLeadAction } from "@/app/admin/actions";
import { LeadTag, PageHead, SOURCE_WORDS } from "@/components/admin/bits";
import { LeadForm } from "@/components/admin/forms";
import { Button, Panel, TimeAgo } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inquiries · Dish360 admin" };

const FILTERS = [
  { id: "open", label: "Open" },
  { id: "new", label: "New" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "all", label: "All" },
] as const;

export default async function AdminInquiries({ searchParams }: { searchParams: { show?: string } }) {
  await requireAdmin("/admin/inquiries");
  const [leads, restaurants, s] = await Promise.all([listLeads(), listRestaurants(), settings()]);
  const show = searchParams.show ?? "open";
  const byId = new Map(restaurants.map((r) => [r.id, r]));

  const shown = leads.filter((l) => {
    if (show === "all") return true;
    if (show === "open") return l.status === "new" || l.status === "contacted";
    return l.status === show;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="Inquiries"
        lede="Demo requests from the home page, messages from the contact page, and owners asking to change plan."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/inquiries?show=${f.id}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-[12px] font-semibold",
              show === f.id ? "bg-sage text-charcoal" : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.08]",
            )}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">
              {f.id === "all"
                ? leads.length
                : f.id === "open"
                  ? leads.filter((l) => l.status === "new" || l.status === "contacted").length
                  : leads.filter((l) => l.status === f.id).length}
            </span>
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <Panel className="p-8 text-center text-[13px] text-ink-dim">Nothing here.</Panel>
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((lead) => {
            const place = lead.restaurantId ? byId.get(lead.restaurantId) : null;
            const wanted = lead.requestedPlan ? planFrom(s.plans, lead.requestedPlan) : null;
            return (
              <li key={lead.id}>
                <Panel className="grid gap-5 p-5 lg:grid-cols-[1.2fr_1fr]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <LeadTag status={lead.status} />
                      <span className="text-[12px] font-semibold text-ink-dim">{SOURCE_WORDS[lead.source]}</span>
                      <span className="text-[12px] text-ink-dim">· <TimeAgo iso={lead.createdAt} /></span>
                    </div>
                    <p className="mt-2 text-[16px] font-semibold text-ink">
                      {lead.restaurantName || "No restaurant name"}
                      {lead.city ? <span className="font-normal text-ink-dim"> · {lead.city}</span> : null}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-plain">
                      {lead.name} ·{" "}
                      <a href={`mailto:${lead.email}`} className="text-sage hover:underline">{lead.email}</a>
                      {lead.phone ? (
                        <>
                          {" · "}
                          <a href={`tel:${lead.phone.replace(/\s+/g, "")}`} className="text-sage hover:underline">{lead.phone}</a>
                        </>
                      ) : null}
                    </p>
                    {lead.message ? (
                      <p className="mt-3 whitespace-pre-line rounded-xl bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-ink-plain">
                        {lead.message}
                      </p>
                    ) : null}
                    {place ? (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <Link href={`/admin/restaurants/${place.id}`} className="text-[12.5px] font-semibold text-sage hover:underline">
                          Open {place.name}
                        </Link>
                        {wanted && lead.status !== "won" && place.plan !== lead.requestedPlan ? (
                          <form action={applyRequestedPlanAction}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <Button type="submit" size="sm">Move them to {wanted.name}</Button>
                          </form>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3">
                    <LeadForm lead={lead} />
                    <form action={deleteLeadAction} className="self-end">
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button type="submit" className="text-[12px] text-ink-dim hover:text-red-300">
                        Delete this inquiry
                      </button>
                    </form>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
