"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ImagePlus, LoaderCircle, Trash2, TriangleAlert, X } from "lucide-react";
import DishArt from "./DishArt";
import {
  Button,
  DoneNote,
  ErrorNote,
  FieldLabel,
  FIELD,
  Lede,
  Panel,
  SectionTitle,
} from "./ui";
import {
  createDishAction,
  deleteDishAction,
  updateDishAction,
  type ActionState,
} from "@/app/dashboard/actions";
import type { Category, Dish, DietTag } from "@/lib/types";
import { DIET_LABELS, SPICE_LABELS, cn, toMajor } from "@/lib/utils";

/**
 * One form for adding a dish and for editing one. The only difference is which
 * action it posts to and whether the remove control is there.
 */

const DIET_TAGS: DietTag[] = [
  "veg",
  "vegan",
  "egg",
  "jain",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "halal",
];

const EMPTY: ActionState = {};

export default function DishForm({
  dish,
  sections,
  currencySymbol,
}: {
  dish?: Dish;
  sections: Category[];
  currencySymbol: string;
}) {
  const editing = Boolean(dish);
  const [state, formAction] = useFormState(
    editing ? updateDishAction : createDishAction,
    EMPTY,
  );

  const [photo, setPhoto] = useState(dish?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [spice, setSpice] = useState(dish?.spiceLevel ?? 0);
  const [flavour, setFlavour] = useState(
    dish?.flavour ?? { savoury: 60, sweet: 40, tang: 40, heat: 10 },
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const payload = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !payload.url) {
        setUploadError(payload.error ?? "The upload did not work.");
        return;
      }
      setPhoto(payload.url);
    } catch {
      setUploadError("Could not reach the server. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {editing ? <input type="hidden" name="dishId" value={dish!.id} /> : null}
      <input type="hidden" name="imageUrl" value={photo} />
      <input type="hidden" name="savoury" value={flavour.savoury} />
      <input type="hidden" name="sweet" value={flavour.sweet} />
      <input type="hidden" name="tang" value={flavour.tang} />
      <input type="hidden" name="heat" value={flavour.heat} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Panel className="p-6">
            <SectionTitle>The dish</SectionTitle>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <input
                  id="name"
                  name="name"
                  required
                  defaultValue={dish?.name ?? ""}
                  className={FIELD}
                  placeholder="Smash Burger"
                />
                <ErrorNote>{state.fieldErrors?.name}</ErrorNote>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="description" hint="What guests read on the menu">
                  Description
                </FieldLabel>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={dish?.description ?? ""}
                  className={cn(FIELD, "resize-y leading-relaxed")}
                  placeholder="What is on the plate, in a sentence or two."
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="price" hint={currencySymbol}>
                    Price
                  </FieldLabel>
                  <input
                    id="price"
                    name="price"
                    inputMode="decimal"
                    defaultValue={dish ? toMajor(dish.priceMinor) : ""}
                    className={cn(FIELD, "tabular-nums")}
                    placeholder="450"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="categoryId">Section</FieldLabel>
                  <select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={dish?.categoryId ?? ""}
                    className={FIELD}
                  >
                    <option value="">No section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="prepMinutes" hint="minutes">
                    Takes about
                  </FieldLabel>
                  <input
                    id="prepMinutes"
                    name="prepMinutes"
                    inputMode="numeric"
                    defaultValue={dish?.prepMinutes ?? ""}
                    className={cn(FIELD, "tabular-nums")}
                    placeholder="14"
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionTitle>What is in it</SectionTitle>
            <Lede className="mt-1.5">
              Allergens and diet labels let guests decide without having to ask a server.
            </Lede>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="ingredients" hint="One per line">
                  Ingredients
                </FieldLabel>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  rows={4}
                  defaultValue={dish?.ingredients.join("\n") ?? ""}
                  className={cn(FIELD, "resize-y")}
                  placeholder={"Beef patty\nCheddar\nOnion\nPotato bun"}
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="allergens" hint="Separated by commas">
                  Allergens
                </FieldLabel>
                <textarea
                  id="allergens"
                  name="allergens"
                  rows={4}
                  defaultValue={dish?.allergens.join(", ") ?? ""}
                  className={cn(FIELD, "resize-y")}
                  placeholder="Wheat, Milk, Egg"
                />
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>Labels</FieldLabel>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {DIET_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="cursor-pointer select-none rounded-full bg-white/[0.04] px-3.5 py-2 text-[12.5px] font-medium text-ink-plain transition-colors hover:bg-white/[0.08] has-[:checked]:bg-sage/[0.16] has-[:checked]:text-sage"
                  >
                    <input
                      type="checkbox"
                      name={`diet.${tag}`}
                      defaultChecked={dish?.dietTags.includes(tag)}
                      className="sr-only"
                    />
                    {DIET_LABELS[tag]}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>How spicy</FieldLabel>
                <input type="hidden" name="spiceLevel" value={spice} />
                <div className="mt-2.5 flex gap-1.5">
                  {SPICE_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setSpice(index as 0 | 1 | 2 | 3)}
                      aria-pressed={spice === index}
                      className={cn(
                        "flex-1 rounded-xl px-3 py-2 text-[12.5px] font-medium transition-colors",
                        spice === index
                          ? "bg-sage/[0.16] text-sage"
                          : "bg-white/[0.04] text-ink-plain hover:bg-white/[0.08]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="calories" hint="if you know it">
                  Calories
                </FieldLabel>
                <input
                  id="calories"
                  name="calories"
                  inputMode="numeric"
                  defaultValue={dish?.calories ?? ""}
                  className={cn(FIELD, "tabular-nums")}
                  placeholder="680"
                />
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionTitle>How it tastes</SectionTitle>
            <Lede className="mt-1.5">
              Roughly. It colours the drawing we use until you upload a photo, and gives
              guests a flavour reading on the dish.
            </Lede>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {(
                [
                  ["savoury", "Savoury"],
                  ["sweet", "Sweet"],
                  ["tang", "Tangy"],
                  ["heat", "Hot"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-[12.5px] font-medium text-ink-plain">
                      {label}
                    </span>
                    <span className="font-mono text-[11.5px] tabular-nums text-sage">
                      {flavour[key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={flavour[key]}
                    aria-label={label}
                    onChange={(e) =>
                      setFlavour((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                    }
                    className="h-1 w-full cursor-pointer appearance-none rounded-full outline-none"
                    style={{
                      background: `linear-gradient(90deg, #8fb495 ${flavour[key]}%, rgba(255,255,255,0.1) ${flavour[key]}%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* ------------------------------------------------------ sidebar --- */}
        <div className="flex flex-col gap-5">
          <Panel className="p-5">
            <SectionTitle className="text-[14px]">Photo</SectionTitle>

            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl">
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="320px"
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <DishArt
                  dishId={dish?.id ?? "new-dish"}
                  name={dish?.name ?? "Your dish"}
                  flavour={flavour}
                  className="h-full w-full"
                />
              )}

              {photo ? (
                <button
                  type="button"
                  onClick={() => setPhoto("")}
                  aria-label="Remove this photo"
                  className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-surface-elevated text-ink shadow-glass ring-1 ring-inset ring-white/[0.07] backdrop-blur-xl"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-white/[0.1] disabled:opacity-50"
            >
              {uploading ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {photo ? "Use a different photo" : "Upload a photo"}
            </button>

            <ErrorNote>{uploadError}</ErrorNote>

            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-dim">
              {photo
                ? "This is what guests see on the menu card."
                : "Plain table, good light, the whole dish in view. A phone photo is fine. Until you add one, the menu shows this drawing."}
            </p>
          </Panel>

          <Panel className="p-5">
            <SectionTitle className="text-[14px]">Who can see it</SectionTitle>
            <div className="mt-4 flex flex-col gap-3">
              <Toggle
                name="published"
                label="On the menu"
                hint="Guests can see this dish"
                defaultChecked={dish?.published ?? false}
              />
              <Toggle
                name="soldOut"
                label="Sold out"
                hint="Still listed, marked unavailable"
                defaultChecked={dish?.soldOut ?? false}
              />
              <Toggle
                name="featured"
                label="Feature it"
                hint="Push it up the menu and the directory"
                defaultChecked={dish?.featured ?? false}
              />
            </div>
          </Panel>

          <Panel className="sticky bottom-4 p-5">
            <Submit editing={editing} />
            <ErrorNote>{state.error}</ErrorNote>
            <DoneNote>{state.done}</DoneNote>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Link
                href="/dashboard/menu"
                className="text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
              >
                Back to the menu
              </Link>
              {editing ? <Remove name={dish!.name} /> : null}
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        <span className="block text-[11.5px] text-ink-dim">{hint}</span>
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-white/10 transition-colors peer-checked:bg-sage/40" />
        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-ink-dim transition-all peer-checked:left-[1.375rem] peer-checked:bg-sage" />
      </span>
    </label>
  );
}

function Submit({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : editing ? (
        "Save changes"
      ) : (
        "Add the dish"
      )}
    </Button>
  );
}

function Remove({ name }: { name: string }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-red-300"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Remove
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2.5 rounded-2xl bg-red-500/[0.1] p-3.5">
      <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-red-200">
        <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Remove {name}? Any table code pointing at it goes back to the whole menu, so the
        printed stand still works.
      </p>
      <div className="flex gap-2">
        {/* Reuses this form, whose hidden dishId the action reads. */}
        <button
          type="submit"
          formAction={deleteDishAction}
          formNoValidate
          className="rounded-full bg-red-500/25 px-3.5 py-1.5 text-[12px] font-semibold text-red-200 transition-colors hover:bg-red-500/35"
        >
          Remove it
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-ink-dim hover:text-ink"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}
