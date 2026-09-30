"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Box, Clock, Flame, MapPin, Star, TriangleAlert } from "lucide-react";
import DishPhoto from "./DishPhoto";
import OrderToTable from "./OrderToTable";
import { ButtonLink, Tag, Well } from "./ui";
import { isLiveInAr } from "@/lib/dish";
import type { Dish, Restaurant, Review } from "@/lib/types";
import { DIET_LABELS, SPICE_LABELS, cn, formatMoney } from "@/lib/utils";

/** One dish, the way a guest sees it before deciding. */
export default function GuestDish({
  dish,
  restaurant,
  sectionName,
  reviews,
  table,
}: {
  dish: Dish;
  restaurant: Restaurant;
  sectionName: string | null;
  reviews: Review[];
  table: string | null;
}) {
  const [tab, setTab] = useState<"about" | "facts" | "reviews">("about");

  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "dish_view",
        dishId: dish.id,
        table: table ?? undefined,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [dish.id, table]);

  const linkTo = (path: string) =>
    table ? `${path}?table=${encodeURIComponent(table)}` : path;

  const in3d = isLiveInAr(dish);

  return (
    <div className="min-h-screen">
      <style>{`.brand{color:${restaurant.brandColor}}.brand-bg{background:${restaurant.brandColor}26}`}</style>

      <div className="px-5 pt-8 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            href={linkTo(`/m/${restaurant.slug}`)}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {restaurant.name}
          </Link>
          {table ? (
            <span className="rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-plain">
              Table {table}
            </span>
          ) : null}
        </div>
      </div>

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[rgba(30,34,38,0.55)] shadow-glass-elevated ring-1 ring-inset ring-white/[0.07]">
            <DishPhoto dish={dish} sizes="(max-width: 1024px) 100vw, 50vw" priority />

            {in3d ? (
              <div className="absolute left-4 top-4">
                <Tag tone="sage" className="backdrop-blur-xl">
                  <Box className="h-3 w-3" />
                  You can see this in 3D
                </Tag>
              </div>
            ) : null}

            {dish.soldOut ? (
              <div className="absolute inset-x-0 bottom-0 bg-background/85 px-5 py-4 backdrop-blur-xl">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-amber-200">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Sold out
                </p>
              </div>
            ) : null}
          </div>

          <div>
            {sectionName ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
                {sectionName}
              </p>
            ) : null}

            <h1 className="mt-3 text-balance text-[clamp(1.8rem,4.6vw,2.7rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
              {dish.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-[26px] font-bold tabular-nums text-ink">
                {formatMoney(dish.priceMinor, dish.currency)}
              </span>
              {dish.rating > 0 ? (
                <span className="flex items-center gap-1.5 text-[13.5px] text-ink-plain">
                  <Star className="h-3.5 w-3.5 fill-sage text-sage" />
                  <span className="font-semibold tabular-nums text-ink">
                    {dish.rating.toFixed(1)}
                  </span>
                  <span className="text-ink-dim">({dish.ratingCount})</span>
                </span>
              ) : null}
              {dish.prepMinutes ? (
                <span className="flex items-center gap-1.5 text-[13px] text-ink-dim">
                  <Clock className="h-3.5 w-3.5" />
                  about {dish.prepMinutes} min
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-pretty text-[15px] leading-relaxed text-ink-plain">
              {dish.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {dish.dietTags.map((tag) => (
                <Tag key={tag}>{DIET_LABELS[tag] ?? tag}</Tag>
              ))}
              {dish.spiceLevel > 0 ? (
                <Tag tone="amber">
                  <Flame className="h-3 w-3" />
                  {SPICE_LABELS[dish.spiceLevel]}
                </Tag>
              ) : null}
            </div>

            <div className="mt-7 flex flex-col gap-3">
              {in3d ? (
                <ButtonLink href={linkTo(`/view/${dish.id}`)} size="lg" className="w-full">
                  <Box className="h-4 w-4" />
                  Put it on your table
                </ButtonLink>
              ) : null}

              <OrderToTable dish={dish} slug={restaurant.slug} table={table} />
            </div>

            <div className="mt-9">
              <div className="flex gap-1.5 border-b border-white/[0.06] pb-3">
                {(
                  [
                    ["about", "What's in it"],
                    ["facts", "The numbers"],
                    ["reviews", reviews.length ? `Reviews (${reviews.length})` : "Reviews"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    aria-pressed={tab === id}
                    className={cn(
                      "rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors",
                      tab === id
                        ? "brand brand-bg"
                        : "text-ink-plain hover:bg-white/[0.06]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="pt-5">
                {tab === "about" ? (
                  <div className="flex flex-col gap-5">
                    {dish.ingredients.length > 0 ? (
                      <div>
                        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
                          Made with
                        </p>
                        <ul className="flex flex-wrap gap-1.5">
                          {dish.ingredients.map((item) => (
                            <li
                              key={item}
                              className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[12.5px] text-ink-plain"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {dish.allergens.length > 0 ? (
                      <div>
                        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
                          Allergens
                        </p>
                        <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-plain">
                          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                          <span>
                            Contains {dish.allergens.join(", ").toLowerCase()}. Tell a
                            server about any allergy before you order — every kitchen
                            handles all of these in one space.
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {tab === "facts" ? (
                  <div className="flex flex-col gap-5">
                    {dish.calories ? (
                      <Well className="px-4 py-3.5">
                        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-dim">
                          Calories
                        </p>
                        <p className="mt-1 text-[19px] font-bold text-ink">
                          {dish.calories}
                          <span className="ml-1 text-[12px] font-medium text-ink-dim">
                            kcal
                          </span>
                        </p>
                      </Well>
                    ) : (
                      <p className="text-[13px] text-ink-plain">
                        This one has no calorie count on it.
                      </p>
                    )}

                    <div>
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
                        How it tastes
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        {(
                          [
                            ["Savoury", dish.flavour.savoury],
                            ["Sweet", dish.flavour.sweet],
                            ["Tangy", dish.flavour.tang],
                            ["Hot", dish.flavour.heat],
                          ] as const
                        ).map(([label, value]) => (
                          <li key={label}>
                            <div className="flex items-baseline justify-between">
                              <span className="text-[12.5px] text-ink-plain">{label}</span>
                              <span className="text-[12px] font-semibold tabular-nums text-ink">
                                {value}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                              <span
                                className="block h-full rounded-r-[3px]"
                                style={{
                                  width: `${Math.max(2, value)}%`,
                                  background: restaurant.brandColor,
                                }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {tab === "reviews" ? (
                  reviews.length === 0 ? (
                    <p className="text-[13px] text-ink-plain">
                      Nobody has written about this one yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {reviews.map((review) => (
                        <li key={review.id}>
                          <Well className="px-4 py-3.5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[13px] font-semibold text-ink">
                                {review.author}
                              </p>
                              <span className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < review.rating
                                        ? "fill-sage text-sage"
                                        : "text-ink-dim",
                                    )}
                                  />
                                ))}
                              </span>
                            </div>
                            <p className="mt-2 text-[13px] leading-relaxed text-ink-plain">
                              {review.comment}
                            </p>
                          </Well>
                        </li>
                      ))}
                    </ul>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
