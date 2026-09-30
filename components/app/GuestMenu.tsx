"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Box, Clock, MapPin, Phone, Search, X } from "lucide-react";
import DishPhoto from "./DishPhoto";
import { Tag } from "./ui";
import { isLiveInAr } from "@/lib/dish";
import type { Category, Dish, Restaurant } from "@/lib/types";
import { DAY_NAMES, DIET_LABELS, cn, formatMoney } from "@/lib/utils";

/**
 * The menu a guest sees after scanning the code on their table.
 *
 * Written for a phone held at a table with food on it: the search and the diet
 * filters sit at the top where a thumb reaches, the sections run underneath,
 * and the table number rides along on every link so an order knows where to go.
 */
export default function GuestMenu({
  restaurant,
  sections,
  dishes,
  table,
  showCredit,
}: {
  restaurant: Restaurant;
  sections: Category[];
  dishes: Dish[];
  table: string | null;
  showCredit: boolean;
}) {
  const [query, setQuery] = useState("");
  const [diets, setDiets] = useState<string[]>([]);
  const [only3d, setOnly3d] = useState(false);
  const [section, setSection] = useState("all");

  // One menu_view per visit.
  useEffect(() => {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "menu_view",
        slug: restaurant.slug,
        table: table ?? undefined,
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [restaurant.slug, table]);

  const dietsAvailable = useMemo(() => {
    const set = new Set<string>();
    for (const dish of dishes) for (const tag of dish.dietTags) set.add(tag);
    return Array.from(set).sort();
  }, [dishes]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      if (
        needle &&
        !`${dish.name} ${dish.description} ${dish.ingredients.join(" ")}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      if (diets.length > 0 && !diets.every((t) => dish.dietTags.includes(t as never))) {
        return false;
      }
      if (only3d && !isLiveInAr(dish)) return false;
      if (section !== "all" && (dish.categoryId ?? "none") !== section) return false;
      return true;
    });
  }, [dishes, query, diets, only3d, section]);

  const groups = useMemo(() => {
    const rows = sections.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      dishes: visible.filter((d) => d.categoryId === s.id),
    }));
    const loose = visible.filter(
      (d) => !d.categoryId || !sections.some((s) => s.id === d.categoryId),
    );
    if (loose.length > 0) {
      rows.push({ id: "none", name: "Everything else", description: "", dishes: loose });
    }
    return rows.filter((row) => row.dishes.length > 0);
  }, [sections, visible]);

  const today = new Date().getDay();
  const hoursToday = restaurant.hours.find((h) => h.day === today);
  const filtering = query !== "" || diets.length > 0 || only3d || section !== "all";

  const linkTo = (path: string) =>
    table ? `${path}?table=${encodeURIComponent(table)}` : path;

  const clear = () => {
    setQuery("");
    setDiets([]);
    setOnly3d(false);
    setSection("all");
  };

  return (
    <div className="min-h-screen">
      {/* The owner's colour tints the accents on their own menu. */}
      <style>{`.brand{color:${restaurant.brandColor}}.brand-bg{background:${restaurant.brandColor}26}`}</style>

      <header className="relative overflow-hidden px-5 pb-8 pt-12 sm:px-8 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80"
          style={{
            background: `radial-gradient(900px 340px at 50% -10%, ${restaurant.brandColor}22 0%, transparent 70%)`,
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          {table ? (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: restaurant.brandColor }}
              />
              <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-plain">
                Table {table}
              </span>
            </p>
          ) : null}

          <h1 className="text-balance text-[clamp(2.2rem,7vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-ink">
            {restaurant.name}
          </h1>

          {restaurant.tagline ? (
            <p className="mt-3 text-[clamp(1.05rem,2.6vw,1.4rem)] text-ink-plain">
              {restaurant.tagline}
            </p>
          ) : null}

          {restaurant.about ? (
            <p className="mt-5 max-w-2xl text-pretty text-[14.5px] leading-relaxed text-ink-plain">
              {restaurant.about}
            </p>
          ) : null}

          <dl className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-[12.5px] text-ink-dim">
            {restaurant.address ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <dd>{restaurant.address}</dd>
              </div>
            ) : null}
            {restaurant.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <dd>
                  <a href={`tel:${restaurant.phone}`} className="hover:text-ink">
                    {restaurant.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {hoursToday ? (
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <dd>
                  {hoursToday.closed
                    ? `Closed on ${DAY_NAMES[today]}s`
                    : `Today ${hoursToday.open} to ${hoursToday.close}`}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </header>

      <div className="sticky top-0 z-30 border-y border-white/[0.06] bg-background/90 px-5 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2.5">
          <div className="relative min-w-[170px] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Look for something"
              aria-label="Look for something on the menu"
              className="w-full rounded-xl bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-ink ring-1 ring-inset ring-white/[0.08] placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-sage/60"
            />
          </div>

          <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setOnly3d((v) => !v)}
              aria-pressed={only3d}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                only3d
                  ? "brand brand-bg"
                  : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.1]",
              )}
            >
              <Box className="h-3.5 w-3.5" />
              See in 3D
            </button>

            {dietsAvailable.map((tag) => {
              const on = diets.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setDiets((v) => (on ? v.filter((x) => x !== tag) : [...v, tag]))
                  }
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                    on
                      ? "brand brand-bg"
                      : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.1]",
                  )}
                >
                  {DIET_LABELS[tag] ?? tag}
                </button>
              );
            })}

            {sections.length > 1 ? (
              <label className="shrink-0">
                <span className="sr-only">Jump to a section</span>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="rounded-xl bg-white/[0.03] py-2.5 pl-3 pr-8 text-[12.5px] text-ink ring-1 ring-inset ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-sage/60"
                >
                  <option value="all">Everything</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {filtering ? (
              <button
                type="button"
                onClick={clear}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <main className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {groups.length === 0 ? (
            <div className="rounded-3xl bg-white/[0.03] px-8 py-16 text-center ring-1 ring-inset ring-white/[0.06]">
              <p className="text-[15px] font-semibold text-ink">
                Nothing matches that
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-4 rounded-full bg-white/[0.08] px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-white/[0.12]"
              >
                Show everything again
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-14">
              {groups.map((group) => (
                <section key={group.id} id={group.id}>
                  <div className="mb-6">
                    <h2 className="text-[clamp(1.4rem,3.5vw,1.9rem)] font-extrabold tracking-tight text-ink">
                      {group.name}
                    </h2>
                    {group.description ? (
                      <p className="mt-1.5 text-[13.5px] text-ink-plain">
                        {group.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {group.dishes.map((dish, index) => (
                      <GuestDishCard
                        key={dish.id}
                        dish={dish}
                        href={linkTo(`/m/${restaurant.slug}/${dish.id}`)}
                        priority={index < 3}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="px-5 pb-12 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-7">
          <p className="flex flex-wrap items-center gap-3 text-[12px] text-ink-dim">
            <span>{dishes.length} dishes</span>
            <span aria-hidden>·</span>
            <span>{dishes.filter(isLiveInAr).length} you can see in 3D</span>
            {restaurant.website ? (
              <>
                <span aria-hidden>·</span>
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-ink"
                >
                  Website
                </a>
              </>
            ) : null}
          </p>

          {showCredit ? (
            <Link
              href="/"
              className="rounded-full bg-white/[0.04] px-3.5 py-2 text-[11px] font-semibold text-ink-dim transition-colors hover:bg-white/[0.08]"
            >
              Menu by Dish360
            </Link>
          ) : null}
        </div>
      </footer>
    </div>
  );
}

function GuestDishCard({
  dish,
  href,
  priority,
}: {
  dish: Dish;
  href: string;
  priority: boolean;
}) {
  const in3d = isLiveInAr(dish);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl bg-surface/80 shadow-glass ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1",
        dish.soldOut && "opacity-70",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <DishPhoto dish={dish} priority={priority} />
        </div>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {in3d ? (
            <Tag tone="sage" className="backdrop-blur-xl">
              <Box className="h-3 w-3" />
              See in 3D
            </Tag>
          ) : (
            <span />
          )}
          {dish.soldOut ? <Tag tone="amber">Sold out</Tag> : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[15px] font-semibold leading-snug text-ink">{dish.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-plain">
          {dish.description}
        </p>

        {dish.dietTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {dish.dietTags.slice(0, 2).map((tag) => (
              <Tag key={tag}>{DIET_LABELS[tag] ?? tag}</Tag>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
          <span className="text-[17px] font-bold tabular-nums text-ink">
            {formatMoney(dish.priceMinor, dish.currency)}
          </span>
          {dish.calories ? (
            <span className="font-mono text-[11px] tabular-nums text-ink-dim">
              {dish.calories} kcal
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
