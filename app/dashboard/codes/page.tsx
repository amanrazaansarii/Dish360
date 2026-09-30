import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/session";
import { listDishes, listTableCodes } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { isLiveInAr } from "@/lib/dish";
import { Eyebrow, Lede, PageTitle } from "@/components/app/ui";
import CodesManager from "./CodesManager";

export const metadata: Metadata = { title: "Table codes · Dish360" };

export default async function CodesPage({
  searchParams,
}: {
  searchParams: { dish?: string };
}) {
  const { restaurant } = await requireAuth();

  const [codes, dishes] = await Promise.all([
    listTableCodes(restaurant.id),
    listDishes(restaurant.id),
  ]);

  // The code has to carry an absolute address, and in development that is
  // whatever host the dev server is answering on.
  const host = headers().get("host") ?? "localhost:3000";
  const scheme = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${scheme}://${host}`;

  const plan = getPlan(restaurant.plan);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Eyebrow>
          {codes.length} code{codes.length === 1 ? "" : "s"}
          {plan.tableCodeLimit !== null ? ` of ${plan.tableCodeLimit}` : ""}
        </Eyebrow>
        <PageTitle className="mt-2">Table codes</PageTitle>
        <Lede className="mt-1.5 max-w-2xl">
          One code per table, printed on a small stand. The code never changes, even when
          your menu does — so you print it once and leave it there.
        </Lede>
      </header>

      <CodesManager
        codes={codes}
        dishes={dishes.map((d) => ({
          id: d.id,
          name: d.name,
          liveIn3d: isLiveInAr(d),
        }))}
        origin={origin}
        presetDishId={searchParams.dish ?? ""}
        planFull={plan.tableCodeLimit !== null && codes.length >= plan.tableCodeLimit}
      />
    </div>
  );
}
