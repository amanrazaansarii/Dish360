import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDish, getRestaurantBySlug, listCategories, listReviews } from "@/lib/db";
import GuestDish from "@/components/app/GuestDish";

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
  const restaurant = await getRestaurantBySlug(params.slug);
  if (!restaurant) notFound();

  const dish = await getDish(params.dishId);
  if (!dish || dish.restaurantId !== restaurant.id || !dish.published) notFound();

  const [sections, reviews] = await Promise.all([
    listCategories(restaurant.id),
    listReviews(dish.id),
  ]);

  const section = sections.find((s) => s.id === dish.categoryId) ?? null;

  return (
    <GuestDish
      dish={dish}
      restaurant={restaurant}
      sectionName={section?.name ?? null}
      reviews={reviews}
      table={searchParams.table ?? null}
    />
  );
}
