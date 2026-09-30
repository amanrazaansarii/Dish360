"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, GripVertical, Pencil, Search, Sparkles } from "lucide-react";
import DishPhoto from "@/components/app/DishPhoto";
import { Panel, Tag } from "@/components/app/ui";
import {
  reorderDishesAction,
  setDishPriceAction,
  toggleDishAction,
} from "@/app/dashboard/actions";
import { dishStatusLabel, isLiveInAr } from "@/lib/dish";
import type { Category, Dish } from "@/lib/types";
import { cn, toMajor } from "@/lib/utils";

/**
 * The menu list.
 *
 * Built for mid-service: the three things an owner changes while the room is
 * full — price, sold out, and whether a dish is shown at all — are one tap
 * away on the row itself, not three screens deep.
 */

type Filter = "all" | "shown" | "hidden" | "no-3d" | "waiting" | "sold-out";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shown", label: "On the menu" },
  { id: "hidden", label: "Not shown" },
  { id: "waiting", label: "Waiting for you" },
  { id: "no-3d", label: "No 3D yet" },
  { id: "sold-out", label: "Sold out" },
];

export default function MenuList({
  dishes,
  sections,
  slug,
  currencySymbol,
}: {
  dishes: Dish[];
  sections: Category[];
  slug: string;
  currencySymbol: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sectionId, setSectionId] = useState("all");
  const [order, setOrder] = useState<string[]>(dishes.map((d) => d.id));
  const [dragging, setDragging] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sectionName = useMemo(
    () => new Map(sections.map((s) => [s.id, s.name])),
    [sections],
  );

  const ordered = useMemo(() => {
    const byId = new Map(dishes.map((d) => [d.id, d]));
    const sorted = order.map((id) => byId.get(id)).filter((d): d is Dish => Boolean(d));
    // Anything added since the last render goes on the end rather than vanishing.
    for (const dish of dishes) if (!order.includes(dish.id)) sorted.push(dish);
    return sorted;
  }, [dishes, order]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ordered.filter((dish) => {
      if (needle && !`${dish.name} ${dish.description}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (sectionId !== "all" && dish.categoryId !== sectionId) return false;

      switch (filter) {
        case "shown":
          return dish.published;
        case "hidden":
          return !dish.published;
        case "no-3d":
          return dish.model.status === "none";
        case "waiting":
          return dish.model.status === "ready" && !dish.model.approved;
        case "sold-out":
          return dish.soldOut;
        default:
          return true;
      }
    });
  }, [ordered, query, filter, sectionId]);

  // Reordering only makes sense against the whole, unfiltered list.
  const canReorder = query === "" && filter === "all" && sectionId === "all";

  const drop = (targetId: string) => {
    if (!dragging || dragging === targetId) return;
    const next = [...order];
    const from = next.indexOf(dragging);
    const to = next.indexOf(targetId);
    if (from === -1 || to === -1) return;

    next.splice(to, 0, ...next.splice(from, 1));
    setOrder(next);
    setDragging(null);

    const data = new FormData();
    data.set("ids", next.join(","));
    startTransition(() => {
      void reorderDishesAction(data);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a dish"
            aria-label="Find a dish"
            className="w-full rounded-xl bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-ink ring-1 ring-inset ring-white/[0.08] placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-sage/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                "rounded-full px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                filter === item.id
                  ? "bg-sage/[0.16] text-sage"
                  : "bg-white/[0.04] text-ink-plain hover:bg-white/[0.08]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {sections.length > 0 ? (
          <label>
            <span className="sr-only">Filter by section</span>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="rounded-xl bg-white/[0.03] py-2.5 pl-3 pr-8 text-[12.5px] text-ink ring-1 ring-inset ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-sage/60"
            >
              <option value="all">All sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.03] px-5 py-8 text-center text-[13.5px] text-ink-plain ring-1 ring-inset ring-white/[0.06]">
          Nothing matches that.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {visible.map((dish) => {
            const status = dishStatusLabel(dish);
            return (
              <li
                key={dish.id}
                draggable={canReorder}
                onDragStart={() => setDragging(dish.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(dish.id)}
                onDragEnd={() => setDragging(null)}
              >
                <Panel
                  className={cn(
                    "flex flex-wrap items-center gap-4 p-3.5 transition-opacity",
                    dragging === dish.id && "opacity-40",
                  )}
                >
                  {canReorder ? (
                    <span
                      aria-hidden
                      title="Drag to move it up or down the menu"
                      className="hidden cursor-grab text-ink-dim sm:block"
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                  ) : null}

                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <DishPhoto dish={dish} sizes="56px" plain />
                  </div>

                  <div className="min-w-[170px] flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dashboard/menu/${dish.id}`}
                        className="text-[14px] font-semibold text-ink hover:text-sage"
                      >
                        {dish.name}
                      </Link>

                      {status.tone === "waiting" ? (
                        <Link href={`/dashboard/menu/${dish.id}#three-d`}>
                          <Tag tone="sage">
                            <Sparkles className="h-3 w-3" />
                            {status.label}
                          </Tag>
                        </Link>
                      ) : (
                        <Tag
                          tone={
                            status.tone === "live"
                              ? isLiveInAr(dish)
                                ? "sage"
                                : "neutral"
                              : status.tone === "off"
                                ? "amber"
                                : "neutral"
                          }
                        >
                          {status.label}
                        </Tag>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] text-ink-dim">
                      {dish.categoryId
                        ? (sectionName.get(dish.categoryId) ?? "No section")
                        : "No section"}
                      {dish.calories ? ` · ${dish.calories} kcal` : ""}
                    </p>
                  </div>

                  {/* Price: the field that changes most often. */}
                  <form action={setDishPriceAction} className="flex items-center gap-1.5">
                    <input type="hidden" name="dishId" value={dish.id} />
                    <span className="text-[12px] text-ink-dim">{currencySymbol}</span>
                    <input
                      name="price"
                      defaultValue={toMajor(dish.priceMinor)}
                      inputMode="decimal"
                      aria-label={`Price of ${dish.name}`}
                      className="w-[82px] rounded-lg bg-white/[0.03] px-2.5 py-1.5 text-right text-[13px] tabular-nums text-ink ring-1 ring-inset ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-sage/60"
                    />
                    <button
                      type="submit"
                      className="rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink"
                    >
                      Save
                    </button>
                  </form>

                  <div className="flex items-center gap-2">
                    <Switch
                      dishId={dish.id}
                      field="soldOut"
                      on={dish.soldOut}
                      label="Sold out"
                      tone="amber"
                    />
                    <Switch
                      dishId={dish.id}
                      field="published"
                      on={dish.published}
                      label={dish.published ? "Shown" : "Hidden"}
                      tone="sage"
                    />

                    <Link
                      href={`/dashboard/menu/${dish.id}`}
                      aria-label={`Edit ${dish.name}`}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>

                    {dish.published ? (
                      <Link
                        href={`/m/${slug}/${dish.id}`}
                        target="_blank"
                        aria-label={`See ${dish.name} the way a guest does`}
                        className="grid h-8 w-8 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11.5px] text-ink-dim">
        {canReorder
          ? "Drag a row to change the order guests see."
          : "Clear the search and filters to drag rows into a new order."}
      </p>
    </div>
  );
}

function Switch({
  dishId,
  field,
  on,
  label,
  tone,
}: {
  dishId: string;
  field: string;
  on: boolean;
  label: string;
  tone: "sage" | "amber";
}) {
  return (
    <form action={toggleDishAction}>
      <input type="hidden" name="dishId" value={dishId} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        className={cn(
          "rounded-full px-3 py-1.5 text-[11.5px] font-bold transition-colors",
          on
            ? tone === "amber"
              ? "bg-amber-400/20 text-amber-200"
              : "bg-sage/20 text-sage"
            : "bg-white/[0.06] text-ink-dim hover:bg-white/[0.1]",
        )}
      >
        {label}
      </button>
    </form>
  );
}
