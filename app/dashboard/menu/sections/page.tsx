import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { listCategories, listDishes } from "@/lib/db";
import { Lede, PageTitle } from "@/components/app/ui";
import SectionsManager from "./SectionsManager";

export const metadata: Metadata = { title: "Sections · Dish360" };

export default async function SectionsPage() {
  const { restaurant } = await requireAuth();

  const [sections, dishes] = await Promise.all([
    listCategories(restaurant.id),
    listDishes(restaurant.id),
  ]);

  const counts = new Map<string, number>();
  for (const dish of dishes) {
    if (!dish.categoryId) continue;
    counts.set(dish.categoryId, (counts.get(dish.categoryId) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Link
          href="/dashboard/menu"
          className="text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
        >
          Your menu
        </Link>
        <PageTitle className="mt-2">Sections</PageTitle>
        <Lede className="mt-1.5 max-w-xl">
          The headings your menu is grouped under. Removing a section keeps its dishes —
          they move to &ldquo;Everything else&rdquo; at the bottom.
        </Lede>
      </header>

      <SectionsManager
        sections={sections.map((s) => ({ ...s, dishes: counts.get(s.id) ?? 0 }))}
        looseDishes={dishes.filter((d) => !d.categoryId).length}
      />
    </div>
  );
}
