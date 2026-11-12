import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDish, getRestaurant } from "@/lib/db";
import { isLiveInAr } from "@/lib/dish";
import ArView from "@/components/app/ArView";
import { MenuUnavailable, PreviewStrip } from "@/components/app/MenuGate";
import { canOrder, guestAccess } from "@/lib/guest";

export async function generateMetadata({
  params,
}: {
  params: { dishId: string };
}): Promise<Metadata> {
  const dish = await getDish(params.dishId);
  if (!dish) return { title: "Not found · Dish360" };
  return {
    title: `${dish.name} on your table`,
    description: `See ${dish.name} at its real size, on the table in front of you.`,
    // Reached by scanning, not by searching; the dish page is the one to index.
    robots: { index: false, follow: true },
  };
}

export default async function ViewPage({
  params,
  searchParams,
}: {
  params: { dishId: string };
  searchParams: { table?: string };
}) {
  const dish = await getDish(params.dishId);
  if (!dish || !dish.published) notFound();

  // Nothing unreleased reaches a guest, even by a guessed link.
  if (!isLiveInAr(dish)) notFound();

  const found = await getRestaurant(dish.restaurantId);
  if (!found) notFound();

  const access = await guestAccess(found);
  if (!access.ok) return <MenuUnavailable name={found.name} />;
  const { restaurant, plan } = access;

  return (
    <>
      {access.preview ? <PreviewStrip reason={access.preview} /> : null}
      <ArView
        dish={dish}
        restaurant={{
          name: restaurant.name,
          slug: restaurant.slug,
          brandColor: restaurant.brandColor,
        }}
        table={searchParams.table ?? null}
        canOrder={canOrder(plan, restaurant)}
      />
    </>
  );
}
