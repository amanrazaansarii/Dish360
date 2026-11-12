import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDish, getRestaurantBySlug, listCategories, listReviews } from "@/lib/db";
import GuestDish from "@/components/app/GuestDish";
import { MenuUnavailable, PreviewStrip } from "@/components/app/MenuGate";
import { canOrder, guestAccess } from "@/lib/guest";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; dishId: string };
}): Promise<Metadata> {
  const [restaurant, dish] = await Promise.all([
    getRestaurantBySlug(params.slug),
    getDish(params.dishId),
  ]);
  if (!restaurant || !dish) return { title: "Not found · Dish360" };

  return {
    title: `${dish.name} · ${restaurant.name}`,
    description: dish.description,
    openGraph: { title: dish.name, description: dish.description, type: "article" },
    alternates: { canonical: `/m/${restaurant.slug}/${dish.id}` },
  };
}

export default async function GuestDishPage({
  params,
  searchParams,
}: {
  params: { slug: string; dishId: string };
  searchParams: { table?: string };
}) {
  const found = await getRestaurantBySlug(params.slug);
  if (!found) notFound();

  const access = await guestAccess(found);
  if (!access.ok) return <MenuUnavailable name={found.name} />;
  const { restaurant, plan } = access;

  const dish = await getDish(params.dishId);
  if (!dish || dish.restaurantId !== restaurant.id || !dish.published) notFound();

  const [sections, reviews] = await Promise.all([
    listCategories(restaurant.id),
    listReviews(dish.id),
  ]);

  const section = sections.find((s) => s.id === dish.categoryId) ?? null;

  return (
    <>
      {access.preview ? <PreviewStrip reason={access.preview} /> : null}
      <GuestDish
        dish={dish}
        restaurant={restaurant}
        sectionName={section?.name ?? null}
        reviews={reviews}
        table={searchParams.table ?? null}
        canOrder={canOrder(plan, restaurant)}
      />
    </>
  );
}
