"use client";

import { useState } from "react";
import { Check, LoaderCircle, Minus, Plus, Receipt } from "lucide-react";
import { Button, Well } from "./ui";
import { formatMoney } from "@/lib/utils";
import type { Dish } from "@/lib/types";

/**
 * Ordering the dish you are looking at.
 *
 * Only offered when the scan carried a table number. Without one there is
 * nowhere to send it, and asking a guest to type their own table number is how
 * food ends up on the wrong one.
 */
export default function OrderToTable({
  dish,
  slug,
  table,
}: {
  dish: Dish;
  slug: string;
  table: string | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!table) {
    return (
      <Well className="px-5 py-4">
        <p className="text-[12.5px] leading-relaxed text-ink-plain">
          Scan the code on your table to order this from here. Otherwise the name above
          is all a server needs.
        </p>
      </Well>
    );
  }

  if (dish.soldOut) {
    return (
      <Well className="px-5 py-4">
        <p className="text-[12.5px] text-amber-200">
          This one has sold out. Ask a server what else is going.
        </p>
      </Well>
    );
  }

  const send = async () => {
    setState("sending");
    setMessage(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          table,
          note: note.trim() || undefined,
          items: [{ dishId: dish.id, quantity }],
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setState("failed");
        setMessage(payload.error ?? "That did not go through.");
        return;
      }
      setState("sent");

      const { default: confetti } = await import("canvas-confetti");
      void confetti({
        particleCount: 70,
        spread: 62,
        startVelocity: 32,
        ticks: 140,
        colors: ["#aad0af", "#8fb495", "#e5e2e1"],
        disableForReducedMotion: true,
      });
    } catch {
      setState("failed");
      setMessage("Could not reach the kitchen. Try again, or ask a server.");
    }
  };

  if (state === "sent") {
    return (
      <Well className="flex items-center gap-3 px-5 py-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage/20">
          <Check className="h-4 w-4 text-sage" />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-ink">
            Sent to the kitchen for table {table}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-dim">
            {quantity} × {dish.name} ·{" "}
            {formatMoney(dish.priceMinor * quantity, dish.currency)}
          </p>
        </div>
      </Well>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Receipt className="h-4 w-4" />
        Order this to table {table}
      </Button>
    );
  }

  return (
    <Well className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[13px] font-medium text-ink-plain">How many?</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setQuantity((v) => Math.max(1, v - 1))}
            aria-label="One fewer"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-ink transition-colors hover:bg-white/[0.12]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-[16px] font-bold tabular-nums text-ink">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((v) => Math.min(20, v + 1))}
            aria-label="One more"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-ink transition-colors hover:bg-white/[0.12]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-dim">
          Anything the kitchen should know?
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={400}
          placeholder="No onions, please"
          className="w-full rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-ink ring-1 ring-inset ring-white/[0.08] placeholder:text-ink-dim focus:outline-none focus:ring-2 focus:ring-sage/60"
        />
      </label>

      <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
        <span className="text-[17px] font-bold tabular-nums text-ink">
          {formatMoney(dish.priceMinor * quantity, dish.currency)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full px-4 py-2.5 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink"
          >
            Not now
          </button>
          <Button type="button" onClick={send} disabled={state === "sending"}>
            {state === "sending" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              `Send it to table ${table}`
            )}
          </Button>
        </div>
      </div>

      {message ? (
        <p role="alert" className="text-[12.5px] text-red-300">
          {message}
        </p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-ink-dim">
        This tells the floor what you want. It is not a payment — settle the bill the
        usual way.
      </p>
    </Well>
  );
}
