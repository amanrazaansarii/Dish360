"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Copy, Download, LoaderCircle, Plus, Printer, QrCode, Trash2 } from "lucide-react";
import {
  createCodeAction,
  createCodeRunAction,
  deleteCodeAction,
  toggleCodeAction,
  type ActionState,
} from "@/app/dashboard/actions";
import {
  Button,
  DoneNote,
  Empty,
  ErrorNote,
  FieldLabel,
  FIELD,
  Lede,
  Panel,
  SectionTitle,
  Tag,
  TimeAgo,
} from "@/components/app/ui";
import type { TableCode } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY: ActionState = {};

interface DishOption {
  id: string;
  name: string;
  liveIn3d: boolean;
}

export default function CodesManager({
  codes,
  dishes,
  origin,
  presetDishId,
  planFull,
}: {
  codes: TableCode[];
  dishes: DishOption[];
  origin: string;
  presetDishId: string;
  planFull: boolean;
}) {
  const [oneState, createOne] = useFormState(createCodeAction, EMPTY);
  const [runState, createRun] = useFormState(createCodeRunAction, EMPTY);
  const [target, setTarget] = useState<"menu" | "dish">(presetDishId ? "dish" : "menu");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      // The browser can refuse the clipboard; the link is on screen anyway.
    }
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel as="section" className="p-6">
          <form action={createOne}>
            <SectionTitle>Add one code</SectionTitle>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="label">What to call it</FieldLabel>
                <input
                  id="label"
                  name="label"
                  required
                  placeholder="Table 11"
                  className={FIELD}
                />
                <ErrorNote>{oneState.fieldErrors?.label}</ErrorNote>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="tableNumber" hint="Optional">
                  Table number
                </FieldLabel>
                <input
                  id="tableNumber"
                  name="tableNumber"
                  placeholder="11"
                  className={cn(FIELD, "tabular-nums")}
                />
                <p className="text-[11px] text-ink-dim">
                  Put the number in and everything a guest does at that table is counted
                  against it.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <FieldLabel>What it opens</FieldLabel>
                <input type="hidden" name="target" value={target} />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTarget("menu")}
                    aria-pressed={target === "menu"}
                    className={cn(
                      "flex-1 rounded-xl px-3.5 py-2.5 text-[12.5px] font-medium transition-colors",
                      target === "menu"
                        ? "bg-sage/[0.16] text-sage"
                        : "bg-white/[0.04] text-ink-plain hover:bg-white/[0.08]",
                    )}
                  >
                    The whole menu
                  </button>
                  <button
                    type="button"
                    onClick={() => setTarget("dish")}
                    aria-pressed={target === "dish"}
                    className={cn(
                      "flex-1 rounded-xl px-3.5 py-2.5 text-[12.5px] font-medium transition-colors",
                      target === "dish"
                        ? "bg-sage/[0.16] text-sage"
                        : "bg-white/[0.04] text-ink-plain hover:bg-white/[0.08]",
                    )}
                  >
                    One dish
                  </button>
                </div>

                {target === "dish" ? (
                  <select
                    name="targetDishId"
                    defaultValue={presetDishId}
                    className={cn(FIELD, "mt-1")}
                  >
                    <option value="">Pick a dish</option>
                    {dishes.map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name}
                        {dish.liveIn3d ? "" : " — no 3D yet"}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>

              <Submit label="Make the code" disabled={planFull} />
              <ErrorNote>{oneState.error}</ErrorNote>
              <DoneNote>{oneState.done}</DoneNote>
            </div>
          </form>
        </Panel>

        <Panel as="section" className="p-6">
          <form action={createRun}>
            <SectionTitle>Number a run of tables</SectionTitle>
            <Lede className="mt-1.5">
              Makes one code per table, labelled and numbered. Tables that already have
              one are left alone.
            </Lede>

            <div className="mt-5 flex items-end gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <FieldLabel htmlFor="from">From table</FieldLabel>
                <input
                  id="from"
                  name="from"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className={cn(FIELD, "tabular-nums")}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <FieldLabel htmlFor="to">To table</FieldLabel>
                <input
                  id="to"
                  name="to"
                  type="number"
                  min={1}
                  defaultValue={12}
                  className={cn(FIELD, "tabular-nums")}
                />
              </div>
            </div>

            <div className="mt-5">
              <Submit label="Make them" disabled={planFull} />
            </div>
            <ErrorNote>{runState.error}</ErrorNote>
            <DoneNote>{runState.done}</DoneNote>

            {planFull ? (
              <p className="mt-3 text-[12.5px] text-amber-200">
                Your plan is full.{" "}
                <Link href="/dashboard/settings#plan" className="underline">
                  See what it covers
                </Link>
                .
              </p>
            ) : null}
          </form>
        </Panel>
      </div>

      {codes.length === 0 ? (
        <Empty
          icon={<QrCode className="h-5 w-5" />}
          title="No table codes yet"
          body="Make one per table. That is how you find out which tables actually use it, and which never do."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle>Your codes</SectionTitle>
            <Link
              href="/dashboard/codes/print"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
            >
              <Printer className="h-3.5 w-3.5" />
              Print all the stands
            </Link>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {codes.map((row) => {
              const link = `${origin}/t/${row.code}`;
              const dish = dishes.find((d) => d.id === row.targetDishId);

              return (
                <li key={row.id}>
                  <Panel className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-semibold text-ink">
                          {row.label}
                        </p>
                        <p className="mt-0.5 font-mono text-[11.5px] text-sage">
                          {row.code}
                        </p>
                      </div>
                      <Tag tone={row.active ? "sage" : "neutral"}>
                        {row.active ? "In use" : "Paused"}
                      </Tag>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl bg-white p-2.5">
                      <div className="relative aspect-square w-full">
                        <Image
                          src={`/api/qr/${row.code}?size=512`}
                          alt={`The code for ${row.label}`}
                          fill
                          sizes="240px"
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <p className="mt-3.5 text-[12px] text-ink-plain">
                      Opens {row.target === "dish" ? (dish?.name ?? "a dish") : "the menu"}
                      {row.tableNumber ? ` · table ${row.tableNumber}` : ""}
                    </p>
                    <p className="mt-1 text-[11.5px] tabular-nums text-ink-dim">
                      {row.scans} scan{row.scans === 1 ? "" : "s"} · last{" "}
                      <TimeAgo iso={row.lastScanAt} />
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => copy(link, row.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-2 text-[11.5px] font-semibold text-ink-plain transition-colors hover:bg-white/[0.1] hover:text-ink"
                      >
                        {copied === row.id ? (
                          <>
                            <Check className="h-3 w-3 text-sage" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Link
                          </>
                        )}
                      </button>

                      <a
                        href={`/api/qr/${row.code}?size=2048&download=1`}
                        download
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-2 text-[11.5px] font-semibold text-ink-plain transition-colors hover:bg-white/[0.1] hover:text-ink"
                      >
                        <Download className="h-3 w-3" />
                        PNG
                      </a>

                      <a
                        href={`/api/qr/${row.code}?format=svg&download=1`}
                        download
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-2 text-[11.5px] font-semibold text-ink-plain transition-colors hover:bg-white/[0.1] hover:text-ink"
                      >
                        <Download className="h-3 w-3" />
                        Vector
                      </a>

                      <Link
                        href={`/dashboard/codes/print?code=${row.code}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-2 text-[11.5px] font-semibold text-ink-plain transition-colors hover:bg-white/[0.1] hover:text-ink"
                      >
                        <Printer className="h-3 w-3" />
                        Stand
                      </Link>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3.5">
                      <form action={toggleCodeAction}>
                        <input type="hidden" name="codeId" value={row.id} />
                        <button
                          type="submit"
                          className="text-[12px] font-medium text-ink-dim transition-colors hover:text-ink"
                        >
                          {row.active ? "Pause it" : "Use it again"}
                        </button>
                      </form>

                      <form action={deleteCodeAction}>
                        <input type="hidden" name="codeId" value={row.id} />
                        <button
                          type="submit"
                          aria-label={`Delete ${row.label}`}
                          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-dim transition-colors hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Submit({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending || disabled} className="w-full">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
