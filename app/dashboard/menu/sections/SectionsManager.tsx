"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  createSectionAction,
  deleteSectionAction,
  renameSectionAction,
  type ActionState,
} from "@/app/dashboard/actions";
import {
  Button,
  DoneNote,
  ErrorNote,
  FIELD,
  Lede,
  Panel,
  SectionTitle,
  Well,
} from "@/components/app/ui";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const EMPTY: ActionState = {};

type Row = Category & { dishes: number };

export default function SectionsManager({
  sections,
  looseDishes,
}: {
  sections: Row[];
  looseDishes: number;
}) {
  const [state, addAction] = useFormState(createSectionAction, EMPTY);

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-2.5">
        {sections.map((section) => (
          <li key={section.id}>
            <Row section={section} />
          </li>
        ))}

        {looseDishes > 0 ? (
          <li>
            <Well className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-[14px] font-medium text-ink-plain">Everything else</p>
                <p className="mt-0.5 text-[11.5px] text-ink-dim">
                  Dishes that are not in a section
                </p>
              </div>
              <span className="text-[12.5px] tabular-nums text-ink-dim">
                {looseDishes} dish{looseDishes === 1 ? "" : "es"}
              </span>
            </Well>
          </li>
        ) : null}
      </ul>

      <Panel className="p-6">
        <form action={addAction}>
          <SectionTitle>Add a section</SectionTitle>
          <Lede className="mt-1.5">
            A heading on your menu, like Breakfast or Drinks.
          </Lede>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <input
              name="name"
              required
              placeholder="Breakfast"
              aria-label="Section name"
              className={FIELD}
            />
            <input
              name="description"
              placeholder="Served all day. Nobody is going to stop you."
              aria-label="A line under the heading"
              className={FIELD}
            />
            <Add />
          </div>

          <ErrorNote>{state.error}</ErrorNote>
          <DoneNote>{state.done}</DoneNote>
        </form>
      </Panel>
    </div>
  );
}

function Add() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Plus className="h-4 w-4" />
          Add
        </>
      )}
    </Button>
  );
}

function Row({ section }: { section: Row }) {
  const [editing, setEditing] = useState(false);
  const [asking, setAsking] = useState(false);

  if (editing) {
    return (
      <Panel className="px-5 py-4">
        <form
          action={renameSectionAction}
          onSubmit={() => setEditing(false)}
          className="flex items-center gap-2.5"
        >
          <input type="hidden" name="categoryId" value={section.id} />
          <input
            name="name"
            defaultValue={section.name}
            autoFocus
            aria-label="Section name"
            className={cn(FIELD, "flex-1 py-2.5")}
          />
          <button
            type="submit"
            aria-label="Save"
            className="grid h-9 w-9 place-items-center rounded-full text-sage transition-colors hover:bg-white/[0.08]"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="Leave it"
            className="grid h-9 w-9 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08]"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      </Panel>
    );
  }

  return (
    <Panel className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{section.name}</p>
        {section.description ? (
          <p className="mt-0.5 text-[12px] text-ink-dim">{section.description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[12.5px] tabular-nums text-ink-dim">
          {section.dishes} dish{section.dishes === 1 ? "" : "es"}
        </span>

        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${section.name}`}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-ink"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {asking ? (
          <form action={deleteSectionAction} className="flex items-center gap-2">
            <input type="hidden" name="categoryId" value={section.id} />
            <button
              type="submit"
              className="rounded-full bg-red-500/20 px-3 py-1.5 text-[11.5px] font-semibold text-red-200 transition-colors hover:bg-red-500/30"
            >
              Remove it
            </button>
            <button
              type="button"
              onClick={() => setAsking(false)}
              className="text-[11.5px] font-medium text-ink-dim hover:text-ink"
            >
              Keep it
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAsking(true)}
            aria-label={`Remove ${section.name}`}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-dim transition-colors hover:bg-white/[0.08] hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </Panel>
  );
}
