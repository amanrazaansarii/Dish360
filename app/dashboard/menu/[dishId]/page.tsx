import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getDish, listCategories } from "@/lib/db";
import { providerStatus } from "@/lib/ar/pipeline";
import { dishStatusLabel } from "@/lib/dish";
import DishForm from "@/components/app/DishForm";
import ThreeDPanel from "@/components/app/ThreeDPanel";
import { Eyebrow, PageTitle, Tag } from "@/components/app/ui";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { dishId: string };
}): Promise<Metadata> {
  const dish = await getDish(params.dishId);
  return { title: dish ? `${dish.name} · Dish360` : "Dish · Dish360" };
}

export default async function DishPage({
  params,
  searchParams,
}: {
  params: { dishId: string };
  searchParams: { new?: string };
}) {
  const { restaurant } = await requireAuth();

  const dish = await getDish(params.dishId);
  // A real id belonging to somebody else has to read as missing.
  if (!dish || dish.restaurantId !== restaurant.id) notFound();

  const sections = await listCategories(restaurant.id);
  const status = dishStatusLabel(dish);
  const symbol = formatMoney(0, restaurant.currency).replace(/[\d.,\s]/g, "") || "₹";

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/dashboard/menu"
            className="text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
          >
            Your menu
          </Link>
          <PageTitle className="mt-2">{dish.name}</PageTitle>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Tag tone={status.tone === "live" ? "sage" : status.tone === "off" ? "amber" : "neutral"}>
              {status.label}
            </Tag>
            <Eyebrow className="normal-case tracking-normal">
              {formatMoney(dish.priceMinor, dish.currency)}
            </Eyebrow>
          </div>
        </div>

        {dish.published && restaurant.published ? (
          <Link
            href={`/m/${restaurant.slug}/${dish.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
          >
            See it on your menu
            <ExternalLink className="h-3.5 w-3.5 text-ink-dim" />
          </Link>
        ) : null}
      </header>

      {searchParams.new ? (
        <p className="rounded-2xl bg-white/[0.03] px-4 py-3 text-[13px] text-sage ring-1 ring-inset ring-white/[0.06]">
          Added. Build the 3D below, have a look at it, then release it to your guests.
        </p>
      ) : null}

      <ThreeDPanel dish={dish} provider={providerStatus()} />

      <DishForm dish={dish} sections={sections} currencySymbol={symbol} />
    </div>
  );
}
