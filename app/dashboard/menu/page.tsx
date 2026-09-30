import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Utensils } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { listCategories, listDishes } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { ButtonLink, Empty, Eyebrow, Lede, PageTitle, Panel, SectionTitle, Tag } from "@/components/app/ui";
import { formatMoney } from "@/lib/utils";
import MenuList from "./MenuList";

export const metadata: Metadata = { title: "Your menu · Dish360" };

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { removed?: string };
}) {
  const { restaurant } = await requireAuth();

  const [dishes, sections] = await Promise.all([
    listDishes(restaurant.id),
    listCategories(restaurant.id),
  ]);

  const plan = getPlan(restaurant.plan);
  const full = plan.dishLimit !== null && dishes.length >= plan.dishLimit;

  // formatMoney gives "₹450"; the first character is the symbol for the row inputs.
  const symbol = formatMoney(0, restaurant.currency).replace(/[\d.,\s]/g, "") || "₹";

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>
            {dishes.length} dish{dishes.length === 1 ? "" : "es"}
            {plan.dishLimit !== null ? ` of ${plan.dishLimit}` : ""}
          </Eyebrow>
          <PageTitle className="mt-2">Your menu</PageTitle>
          <Lede className="mt-1.5 max-w-xl">
            Change a price, add a dish, or mark one sold out. Every table shows it on the
            guest&apos;s next tap — there is nothing to reprint.
          </Lede>
        </div>

        {full ? (
          <div className="flex items-center gap-3">
            <Tag tone="amber">Plan is full</Tag>
            <ButtonLink href="/dashboard/settings#plan" size="sm" variant="ghost">
              What it covers
            </ButtonLink>
          </div>
        ) : (
          <ButtonLink href="/dashboard/menu/new" size="sm">
            <Plus className="h-3.5 w-3.5" />
            Add a dish
          </ButtonLink>
        )}
      </header>

      {searchParams.removed ? (
        <p className="rounded-2xl bg-white/[0.03] px-4 py-3 text-[13px] text-sage ring-1 ring-inset ring-white/[0.06]">
          That dish has been removed.
        </p>
      ) : null}

      {dishes.length === 0 ? (
        <Empty
          icon={<Utensils className="h-5 w-5" />}
          title="Nothing on the menu yet"
          body="Add your first dish and upload one clear photo of it. That is all the preparation you need."
          action={
            <ButtonLink href="/dashboard/menu/new" size="sm">
              <Plus className="h-3.5 w-3.5" />
              Add your first dish
            </ButtonLink>
          }
        />
      ) : (
        <MenuList
          dishes={dishes}
          sections={sections}
          slug={restaurant.slug}
          currencySymbol={symbol}
        />
      )}

      <Panel className="p-6">
        <SectionTitle>Sections</SectionTitle>
        <Lede className="mt-1.5">
          The headings your menu is grouped under. A dish with no section sits at the
          bottom under &ldquo;Everything else&rdquo;.
        </Lede>
        <Link
          href="/dashboard/menu/sections"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white/[0.1]"
        >
          Manage sections ({sections.length})
        </Link>
      </Panel>
    </div>
  );
}
