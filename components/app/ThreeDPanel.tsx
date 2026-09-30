"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Box,
  Check,
  Download,
  ExternalLink,
  Eye,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  TriangleAlert,
  Wand,
} from "lucide-react";
import ModelViewer from "./ModelViewer";
import {
  Button,
  DoneNote,
  ErrorNote,
  Lede,
  Panel,
  SectionTitle,
  Tag,
  Well,
} from "./ui";
import {
  approveModelAction,
  buildModelAction,
  removeModelAction,
  saveModelLookAction,
  type ActionState,
} from "@/app/dashboard/actions";
import type { Dish, ModelEnvironment } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ModelViewerElement } from "@/types/model-viewer";

/**
 * Step 2 of the home page, in one panel:
 *   "We turn each photo into 3D … You check every dish and approve it before
 *    any guest sees it."
 *
 * So the order here is build → look → release. Nothing reaches a guest until
 * the owner presses the last one, and rebuilding sends it back for checking.
 */

const EMPTY: ActionState = {};

const LIGHTS: { id: ModelEnvironment; label: string }[] = [
  { id: "warm", label: "Warm" },
  { id: "studio", label: "Bright" },
  { id: "neutral", label: "Plain" },
  { id: "soft", label: "Soft" },
];

export default function ThreeDPanel({
  dish,
  provider,
}: {
  dish: Dish;
  provider: { label: string; connected: boolean; note: string };
}) {
  const [state, buildAction] = useFormState(buildModelAction, EMPTY);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [look, setLook] = useState({
    exposure: dish.model.exposure,
    shadowIntensity: dish.model.shadowIntensity,
    shadowSoftness: dish.model.shadowSoftness,
    scale: dish.model.scale,
    autoRotate: dish.model.autoRotate,
    environment: dish.model.environment,
  });
  const [savedLook, setSavedLook] = useState(false);
  const [savingLook, setSavingLook] = useState(false);
  const [size, setSize] = useState<{ x: number; y: number; z: number } | null>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);

  const built = dish.model.status === "ready" && Boolean(dish.model.glbUrl);
  const released = built && dish.model.approved;

  const onReady = useCallback((element: ModelViewerElement) => {
    viewerRef.current = element;
    try {
      setSize(element.getDimensions());
    } catch {
      setSize(null);
    }
  }, []);

  const change = <K extends keyof typeof look>(key: K, value: (typeof look)[K]) => {
    setLook((prev) => ({ ...prev, [key]: value }));
    setSavedLook(false);
  };

  const saveLook = async () => {
    setSavingLook(true);
    try {
      const data = new FormData();
      data.set("dishId", dish.id);
      data.set("exposure", String(look.exposure));
      data.set("shadowIntensity", String(look.shadowIntensity));
      data.set("shadowSoftness", String(look.shadowSoftness));
      data.set("scale", String(look.scale));
      data.set("autoRotate", String(look.autoRotate));
      data.set("environment", look.environment);
      await saveModelLookAction(data);
      setSavedLook(true);
    } finally {
      setSavingLook(false);
    }
  };

  return (
    <Panel id="three-d" className="scroll-mt-24 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionTitle className="flex items-center gap-2.5">
            <Box className="h-4 w-4 text-sage" />
            The 3D
          </SectionTitle>
          <Lede className="mt-1.5 max-w-lg">{provider.note}</Lede>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {released ? (
            <Tag tone="sage">
              <Check className="h-3 w-3" />
              Guests can see it
            </Tag>
          ) : built ? (
            <Tag tone="amber">Waiting for you</Tag>
          ) : dish.model.status === "failed" ? (
            <Tag tone="danger">Build failed</Tag>
          ) : (
            <Tag>Not built</Tag>
          )}
          {dish.model.vertices ? (
            <span className="font-mono text-[11.5px] tabular-nums text-ink-dim">
              {dish.model.vertices.toLocaleString("en-IN")} points
            </span>
          ) : null}
        </div>
      </div>

      {dish.model.error ? (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-500/[0.1] px-4 py-3 text-[12.5px] text-red-200">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {dish.model.error}
        </p>
      ) : null}

      {built ? (
        <>
          {/* ------------------------------------------- the release gate --- */}
          {!released ? (
            <Well className="mt-5 flex flex-wrap items-center justify-between gap-4 border-l-2 border-l-sage p-5">
              <div className="min-w-[240px] flex-1">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  <Sparkles className="h-4 w-4 text-sage" />
                  Have a look, then release it
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-plain">
                  Turn it around and check it looks like the real plate. Until you
                  release it, guests see the photo but cannot open it in 3D.
                </p>
              </div>
              <form action={approveModelAction}>
                <input type="hidden" name="dishId" value={dish.id} />
                <input type="hidden" name="approve" value="1" />
                <Button type="submit" size="lg">
                  <Check className="h-4 w-4" />
                  Release it to guests
                </Button>
              </form>
            </Well>
          ) : (
            <Well className="mt-5 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <p className="flex items-center gap-2 text-[13px] text-ink-plain">
                <Check className="h-3.5 w-3.5 text-sage" />
                Released. Guests can open this dish in 3D.
              </p>
              <form action={approveModelAction}>
                <input type="hidden" name="dishId" value={dish.id} />
                <input type="hidden" name="approve" value="0" />
                <button
                  type="submit"
                  className="text-[12.5px] font-medium text-ink-dim transition-colors hover:text-amber-200"
                >
                  Take it back off
                </button>
              </form>
            </Well>
          )}

          {/* ---------------------------------------------- the 3D itself --- */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[rgba(30,34,38,0.55)] shadow-glass-elevated ring-1 ring-inset ring-white/[0.07]">
              <ModelViewer
                key={dish.model.glbUrl as string}
                src={dish.model.glbUrl as string}
                iosSrc={dish.model.usdzUrl}
                alt={`${dish.name} in 3D`}
                environment={look.environment}
                exposure={look.exposure}
                shadowIntensity={look.shadowIntensity}
                shadowSoftness={look.shadowSoftness}
                autoRotate={look.autoRotate}
                scale={look.scale}
                onReady={onReady}
                className="min-h-[360px]"
              />

              <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                <span className="rounded-full bg-surface-elevated px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sage shadow-glass ring-1 ring-inset ring-white/[0.07] backdrop-blur-xl">
                  drag to turn it
                </span>
                {size ? (
                  <span className="rounded-full bg-surface-elevated px-3 py-1.5 font-mono text-[10.5px] tabular-nums text-ink-plain shadow-glass ring-1 ring-inset ring-white/[0.07] backdrop-blur-xl">
                    {(size.x * 100).toFixed(0)} × {(size.z * 100).toFixed(0)} ×{" "}
                    {(size.y * 100).toFixed(0)} cm
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-4 left-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => viewerRef.current?.resetTurntableRotation(0)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Straighten it up
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl bg-surface/80 p-6 shadow-glass ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">
                  How it looks
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-plain">
                  Guests see exactly what you set here.
                </p>
              </div>

              <div>
                <p className="mb-2.5 text-[12px] font-semibold text-ink-plain">Light</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {LIGHTS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => change("environment", option.id)}
                      className={cn(
                        "rounded-xl px-3 py-2 text-[12.5px] font-medium transition-colors",
                        look.environment === option.id
                          ? "bg-sage/[0.16] text-sage"
                          : "bg-white/[0.04] text-ink-plain hover:bg-white/[0.08]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Slider
                icon={<Sun className="h-3.5 w-3.5" />}
                label="Brightness"
                value={look.exposure}
                min={0.3}
                max={2}
                step={0.05}
                onChange={(v) => change("exposure", v)}
              />
              <Slider
                label="Shadow"
                value={look.shadowIntensity}
                min={0}
                max={2}
                step={0.05}
                onChange={(v) => change("shadowIntensity", v)}
              />
              <Slider
                label="Size on the table"
                value={look.scale}
                min={0.5}
                max={1.8}
                step={0.05}
                hint="1.00 is the real size we measured"
                onChange={(v) => change("scale", v)}
              />

              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-ink-plain">
                  Turn slowly on its own
                </span>
                <span className="relative inline-flex h-6 w-11 items-center">
                  <input
                    type="checkbox"
                    checked={look.autoRotate}
                    onChange={(e) => change("autoRotate", e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="absolute inset-0 rounded-full bg-white/10 transition-colors peer-checked:bg-sage/40" />
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-ink-dim transition-all peer-checked:left-[1.375rem] peer-checked:bg-sage" />
                </span>
              </label>

              <div className="flex items-center gap-2.5">
                <Button size="sm" variant="ghost" onClick={saveLook} disabled={savingLook}>
                  {savingLook ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  Save how it looks
                </Button>
                {savedLook ? <span className="text-[12.5px] text-sage">Saved</span> : null}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------- other bits --- */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href={`/view/${dish.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
            >
              <Eye className="h-3.5 w-3.5" />
              See it the way a guest does
              <ExternalLink className="h-3 w-3 text-ink-dim" />
            </Link>

            <a
              href={dish.model.glbUrl as string}
              download
              className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1]"
            >
              <Download className="h-3.5 w-3.5" />
              Download it
            </a>

            <form action={buildAction}>
              <input type="hidden" name="dishId" value={dish.id} />
              <RebuildButton />
            </form>

            {confirmRemove ? (
              <form action={removeModelAction} className="flex items-center gap-2">
                <input type="hidden" name="dishId" value={dish.id} />
                <button
                  type="submit"
                  className="rounded-full bg-red-500/20 px-4 py-2.5 text-[12.5px] font-semibold text-red-200 transition-colors hover:bg-red-500/30"
                >
                  Yes, remove the 3D
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="text-[12.5px] font-medium text-ink-dim hover:text-ink"
                >
                  Keep it
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
        </>
      ) : (
        <form action={buildAction} className="mt-5">
          <input type="hidden" name="dishId" value={dish.id} />
          <Well className="px-6 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage/[0.15]">
                <Wand className="h-5 w-5 text-sage" />
              </span>
              <div>
                <p className="text-[14.5px] font-semibold text-ink">
                  No 3D for this dish yet
                </p>
                <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-plain">
                  Guests can see the photo, but they cannot put this dish on their table
                  until it is built. It takes a few seconds, and you can redo it whenever
                  you like.
                </p>
              </div>
              <BuildButton />
              <p className="font-mono text-[11px] text-ink-dim">via {provider.label}</p>
            </div>
          </Well>
        </form>
      )}

      <ErrorNote>{state.error}</ErrorNote>
      <DoneNote>{state.done}</DoneNote>
    </Panel>
  );
}

function BuildButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Building it…
        </>
      ) : (
        <>
          <Wand className="h-4 w-4" />
          Build the 3D
        </>
      )}
    </Button>
  );
}

function RebuildButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-white/[0.1] disabled:opacity-50"
    >
      {pending ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Wand className="h-3.5 w-3.5" />
      )}
      Build it again
    </button>
  );
}

function Slider({
  icon,
  label,
  value,
  min,
  max,
  step,
  hint,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-plain">
          {icon}
          {label}
        </span>
        <span className="font-mono text-[11.5px] tabular-nums text-sage">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full outline-none"
        style={{
          background: `linear-gradient(90deg, #8fb495 ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
        }}
      />
      {hint ? <p className="mt-1.5 text-[11px] text-ink-dim">{hint}</p> : null}
    </div>
  );
}
