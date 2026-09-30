import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { listCategories, listDishes } from "@/lib/db";
import { dishLimitReached } from "@/lib/plans";
import DishForm from "@/components/app/DishForm";
import { Lede, PageTitle } from "@/components/app/ui";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Add a dish · Dish360" };

export default async function NewDishPage() {
  const { restaurant } = await requireAuth();

  const [sections, dishes] = await Promise.all([
    listCategories(restaurant.id),
    listDishes(restaurant.id),
  ]);

  // Don't show a form that cannot be submitted.
  if (dishLimitReached(restaurant.plan, dishes.length)) redirect("/dashboard/settings#plan");

  const symbol = formatMoney(0, restaurant.currency).replace(/[\d.,\s]/g, "") || "₹";

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Link
          href="/dashboard/menu"
          className="text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
        >
          Your menu
        </Link>
        <PageTitle className="mt-2">Add a dish</PageTitle>
        <Lede className="mt-1.5">
          Name it and save. You can build the 3D and upload the photo straight after.
        </Lede>
      </header>

      <DishForm sections={sections} currencySymbol={symbol} />
    </div>
  );
}
