import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, listCategories, listDishes } from "@/lib/db";
import { guestAccess } from "@/lib/guest";
import GuestMenu from "@/components/app/GuestMenu";
import { MenuUnavailable, PreviewStrip } from "@/components/app/MenuGate";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const restaurant = await getRestaurantBySlug(params.slug);
  if (!restaurant) return { title: "Menu not found · Dish360" };

  return {
    title: `${restaurant.name} · the menu`,
    description:
      restaurant.about ||
      `See the food at ${restaurant.name} in 3D before you order. Nothing to download.`,
    openGraph: {
      title: `${restaurant.name} · the menu`,
      description: restaurant.tagline || restaurant.about,
      type: "website",
    },
    alternates: { canonical: `/m/${restaurant.slug}` },
  };
}

export default async function GuestMenuPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { table?: string };
}) {
  const found = await getRestaurantBySlug(params.slug);
  if (!found) notFound();

  const access = await guestAccess(found);
  if (!access.ok) return <MenuUnavailable name={found.name} />;
  const { restaurant, plan } = access;

  const [sections, dishes] = await Promise.all([
    listCategories(restaurant.id),
    listDishes(restaurant.id, { publishedOnly: true }),
  ]);

  // Structured data, so the menu is readable by search engines. Part of the
  // point of a menu that lives on the web rather than in a PDF.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.about,
    servesCuisine: restaurant.cuisine,
    telephone: restaurant.phone || undefined,
    address: restaurant.address
      ? {
          "@type": "PostalAddress",
          streetAddress: restaurant.address,
          addressLocality: restaurant.city,
        }
      : undefined,
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: sections.map((section) => ({
        "@type": "MenuSection",
        name: section.name,
        hasMenuItem: dishes
          .filter((d) => d.categoryId === section.id)
          .map((d) => ({
            "@type": "MenuItem",
            name: d.name,
            description: d.description,
            offers: {
              "@type": "Offer",
              price: (d.priceMinor / 100).toFixed(2),
              priceCurrency: d.currency,
            },
            suitableForDiet: d.dietTags.includes("vegan")
              ? "https://schema.org/VeganDiet"
              : d.dietTags.includes("veg")
                ? "https://schema.org/VegetarianDiet"
                : undefined,
          })),
      })),
    },
  };

  return (
    <>
      {access.preview ? <PreviewStrip reason={access.preview} /> : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuestMenu
        restaurant={restaurant}
        sections={sections}
        dishes={dishes}
        table={searchParams.table ?? null}
        showCredit={!plan.features.removeCredit}
      />
    </>
  );
}
