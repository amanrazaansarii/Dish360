"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Box, Flame, Info, MapPin, Smartphone, X } from "lucide-react";
import ModelViewer from "./ModelViewer";
import OrderToTable from "./OrderToTable";
import { Button, Well } from "./ui";
import type { Dish } from "@/lib/types";
import { SPICE_LABELS, cn, formatMoney } from "@/lib/utils";
import type { ModelViewerElement } from "@/types/model-viewer";

/**
 * Step 4 of the home page, the part that is the whole point:
 *
 *   "They tap a dish and it appears on the table in front of them, at real size."
 *
 * Deliberately bare. This is the first thing a guest sees seconds after
 * scanning, often on café wifi, so there is no navigation, no background canvas
 * and nothing else competing: one dish, a couple of facts, and the button.
 */
export default function ArView({
  dish,
  restaurant,
  table,
}: {
  dish: Dish;
  restaurant: { name: string; slug: string; brandColor: string };
  table: string | null;
}) {
  const [facts, setFacts] = useState(true);
  const [arState, setArState] = useState<"unknown" | "ready" | "none" | "failed">(
    "unknown",
  );
  const viewerRef = useRef<ModelViewerElement | null>(null);

  const linkTo = (path: string) =>
    table ? `${path}?table=${encodeURIComponent(table)}` : path;

  // One ar_open when they arrive, and how long they stayed when they leave.
  useEffect(() => {
    const opened = Date.now();

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "ar_open",
        dishId: dish.id,
        table: table ?? undefined,
      }),
      keepalive: true,
    }).catch(() => undefined);

    const report = () => {
      const seconds = Math.round((Date.now() - opened) / 1000);
      if (seconds < 1) return;
      const body = JSON.stringify({
        kind: "ar_close",
        dishId: dish.id,
        table: table ?? undefined,
        seconds: Math.min(3600, seconds),
      });
      // sendBeacon survives the tab closing; a fetch usually does not.
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" }),
        );
      }
    };

    window.addEventListener("pagehide", report);
    return () => {
      window.removeEventListener("pagehide", report);
      report();
    };
  }, [dish.id, table]);

  const onReady = useCallback((element: ModelViewerElement) => {
    viewerRef.current = element;
    setArState(element.canActivateAR ? "ready" : "none");
  }, []);

  const placeIt = async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      await viewer.activateAR();
    } catch {
      setArState("failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={linkTo(`/m/${restaurant.slug}/${dish.id}`)}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <p className="truncate text-[12px] font-bold uppercase tracking-[0.16em] text-ink-dim">
          {restaurant.name}
          {table ? ` · Table ${table}` : ""}
        </p>
      </header>

      <div className="relative flex-1">
        <div className="absolute inset-0">
          <ModelViewer
            src={dish.model.glbUrl as string}
            iosSrc={dish.model.usdzUrl}
            alt={`${dish.name} in 3D`}
            environment={dish.model.environment}
            exposure={dish.model.exposure}
            shadowIntensity={dish.model.shadowIntensity}
            shadowSoftness={dish.model.shadowSoftness}
            autoRotate={dish.model.autoRotate}
            scale={dish.model.scale}
            onReady={onReady}
          />
        </div>

        {/* Corner brackets, the same treatment as the QR card on the home page. */}
        <div aria-hidden className="pointer-events-none absolute inset-6 sm:inset-10">
          {(
            [
              "left-0 top-0 border-l-2 border-t-2 rounded-tl-xl",
              "right-0 top-0 border-r-2 border-t-2 rounded-tr-xl",
              "left-0 bottom-0 border-b-2 border-l-2 rounded-bl-xl",
              "right-0 bottom-0 border-b-2 border-r-2 rounded-br-xl",
            ] as const
          ).map((corner) => (
            <span
              key={corner}
              className={`absolute h-9 w-9 ${corner}`}
              style={{ borderColor: "rgba(170, 208, 175, 0.4)" }}
            />
          ))}
        </div>

        {facts ? (
          <>
            {dish.calories ? (
              <Fact className="left-3 top-[14%] sm:left-[8%] sm:top-[22%]" label="Calories">
                {dish.calories} kcal
              </Fact>
            ) : null}
            {dish.spiceLevel > 0 ? (
              <Fact
                className="bottom-16 left-3 sm:bottom-[28%] sm:left-[10%]"
                label="Heat"
                icon={Flame}
              >
                {SPICE_LABELS[dish.spiceLevel]}
              </Fact>
            ) : null}
            {dish.allergens.length > 0 ? (
              <Fact
                className="right-3 top-[14%] max-w-[48%] sm:right-[6%] sm:top-[30%]"
                label="Contains"
                icon={MapPin}
              >
                {dish.allergens.slice(0, 2).join(", ").toLowerCase()}
              </Fact>
            ) : null}
          </>
        ) : null}

        <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
          drag to turn it
        </p>
      </div>

      <div className="rounded-t-[2rem] bg-surface/90 px-5 pb-7 pt-5 shadow-glass ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl sm:px-7">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-balance text-[19px] font-bold leading-snug text-ink">
                {dish.name}
              </h1>
              <p className="mt-1 text-[12.5px] text-ink-dim">
                This is its real size. Drag to turn it round.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <p
                className="text-[22px] font-bold tabular-nums"
                style={{ color: restaurant.brandColor }}
              >
                {formatMoney(dish.priceMinor, dish.currency)}
              </p>
              <button
                type="button"
                onClick={() => setFacts((v) => !v)}
                aria-pressed={facts}
                aria-label={facts ? "Hide the labels" : "Show the labels"}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.06] hover:text-ink"
              >
                {facts ? <X className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5">
            {arState === "none" ? (
              <Well className="flex items-start gap-3 px-4 py-3">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-ink-dim" />
                <p className="text-[12.5px] leading-relaxed text-ink-plain">
                  This screen cannot put the dish on a real table, so it is showing it in
                  3D instead. Open the same page on a phone and it will land on the table
                  in front of you.
                </p>
              </Well>
            ) : (
              <Button
                type="button"
                size="lg"
                onClick={placeIt}
                disabled={arState === "unknown"}
                className="w-full"
              >
                <Box className="h-4 w-4" />
                Put it on your table
              </Button>
            )}

            {arState === "failed" ? (
              <p className="text-[12.5px] text-amber-200">
                The camera would not start. Your browser may need permission to use it.
              </p>
            ) : null}

            <OrderToTable dish={dish} slug={restaurant.slug} table={table} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({
  label,
  children,
  className,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  icon?: typeof Box;
}) {
  return (
    <div className={cn("pointer-events-none absolute", className)}>
      <div className="flex items-center gap-2.5 rounded-2xl bg-[rgba(30,34,38,0.55)] px-3.5 py-2.5 shadow-glass-elevated ring-1 ring-inset ring-white/[0.07] backdrop-blur-[24px]">
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-sage" /> : null}
        <div className="min-w-0">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-ink-dim">
            {label}
          </p>
          <p className="truncate text-[12.5px] font-semibold text-ink">{children}</p>
        </div>
      </div>
    </div>
  );
}
