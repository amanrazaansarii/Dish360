import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Box, MapPin, Utensils } from "lucide-react";
import { listCategories, listDishes, listRestaurants } from "@/lib/db";
import { isLiveInAr } from "@/lib/dish";
import { Empty, Lede, PageTitle, Panel, Tag } from "@/components/app/ui";

export const metadata: Metadata = {
  title: "Menus on Dish360",
  description:
    "Places using Dish360. Look through the food in 3D before you decide where to go.",
};

/**
 * Every published menu in one list.
 *
 * The point the home page makes about a menu living on the web rather than in a
 * PDF: somebody can look through the food before they have chosen where to eat.
 */
export default async function MenusPage() {
  const restaurants = await listRestaurants({ publishedOnly: true });

  const rows = await Promise.all(
    restaurants.map(async (restaurant) => {
      const [dishes, sections] = await Promise.all([
        listDishes(restaurant.id, { publishedOnly: true }),
        listCategories(restaurant.id),
      ]);
      return {
        restaurant,
        dishes: dishes.length,
        in3d: dishes.filter(isLiveInAr).length,
        sections: sections.length,
      };
    }),
  );

  return (
    <div className="min-h-screen px-5 pb-16 pt-14 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
          Menus on Dish360
        </p>
        <PageTitle className="mt-5 max-w-3xl text-[clamp(2.2rem,6vw,3.4rem)]">
          Look at the food before you decide where to go.
        </PageTitle>
        <Lede className="mt-5 max-w-xl text-[15px]">
          Every menu here is live. Open a dish, turn it round, see what is in it — then
          walk in knowing what you want.
        </Lede>

        {rows.length === 0 ? (
          <Empty
            className="mt-12"
            icon={<Utensils className="h-5 w-5" />}
            title="No menus published yet"
            body="Places appear here once they publish."
          />
        ) : (
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map(({ restaurant, dishes, in3d }) => (
              <li key={restaurant.id}>
                <Link href={`/m/${restaurant.slug}`} className="group block h-full">
                  <Panel className="flex h-full flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                    <div
                      className="h-24 w-full"
                      style={{
                        background: `linear-gradient(135deg, ${restaurant.brandColor}33 0%, transparent 70%)`,
                      }}
                    />
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="text-[19px] font-bold tracking-tight text-ink">
                          {restaurant.name}
                        </h2>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-dim transition-colors group-hover:text-sage" />
                      </div>

                      {restaurant.tagline ? (
                        <p className="mt-1.5 text-[14px] text-ink-plain">
                          {restaurant.tagline}
                        </p>
                      ) : null}

                      <p className="mt-3.5 flex items-center gap-1.5 text-[12.5px] text-ink-dim">
                        <MapPin className="h-3.5 w-3.5" />
                        {restaurant.city || "Somewhere"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {restaurant.cuisine.slice(0, 3).map((item) => (
                          <Tag key={item}>{item}</Tag>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-4 pt-5 text-[12px] text-ink-dim">
                        <span>{dishes} dishes</span>
                        <span className="flex items-center gap-1.5 text-sage">
                          <Box className="h-3 w-3" />
                          {in3d} in 3D
                        </span>
                      </div>
                    </div>
                  </Panel>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-14 text-center text-[13px] text-ink-dim">
          Run a place?{" "}
          <Link href="/signup" className="font-semibold text-sage hover:underline">
            Put your own menu on here
          </Link>
        </p>
      </div>
    </div>
  );
}
