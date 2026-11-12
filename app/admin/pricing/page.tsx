import { requireAdmin } from "@/lib/auth/admin";
import { settings } from "@/lib/platform";
import { PageHead, shortDate } from "@/components/admin/bits";
import { PlansForm, PlatformForm } from "@/components/admin/forms";
import { Panel, SectionTitle } from "@/components/app/ui";

export const metadata = { title: "Plans & pricing · Dish360 admin" };

export default async function AdminPricing() {
  await requireAdmin("/admin/pricing");
  const s = await settings();
  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="Plans & pricing"
        lede="What each plan costs and allows. Saving applies straight away: limits are checked on every dish, code and 3D build, and owners see the new prices under Settings."
      />

      <Panel className="p-6">
        <SectionTitle>The three plans</SectionTitle>
        <p className="mt-1 text-[12.5px] text-ink-dim">Last changed {shortDate(s.updatedAt)}.</p>
        <div className="mt-5">
          <PlansForm plans={s.plans} currency={s.currency} />
        </div>
      </Panel>

      <Panel className="p-6">
        <SectionTitle>Costs and billing</SectionTitle>
        <p className="mt-1.5 max-w-2xl text-[13px] text-ink-plain">
          Set what the paid 3D service charges you for each model. Every build that goes to
          it is costed at this price when it runs, which is what the 3D &amp; API costs page
          adds up. Built-in builds cost nothing.
        </p>
        <div className="mt-5">
          <PlatformForm settings={s} />
        </div>
      </Panel>
    </div>
  );
}
