"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelEnvironment } from "@/lib/types";
import type { ModelViewerElement } from "@/types/model-viewer";

/**
 * Thin React wrapper around `<model-viewer>`.
 *
 * The element is registered by a dynamic import so the ~300KB WebGL bundle only
 * loads on routes that actually render a model, and never during SSR.
 */

export interface ModelViewerProps {
  src: string;
  iosSrc?: string | null;
  alt: string;
  poster?: string;
  environment?: ModelEnvironment;
  exposure?: number;
  shadowIntensity?: number;
  shadowSoftness?: number;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  scale?: number;
  className?: string;
  /** Receives the element once it is registered, for imperative control. */
  onReady?: (element: ModelViewerElement) => void;
  onModelLoad?: () => void;
  onArStatusChange?: (status: string) => void;
}

/**
 * model-viewer ships no HDR files of its own, so the "environments" are
 * expressed through tone mapping and exposure rather than an external .hdr —
 * one less asset to host and nothing to 404.
 */
const ENVIRONMENTS: Record<
  NonNullable<ModelViewerProps["environment"]>,
  { exposure: number; toneMapping: string }
> = {
  studio: { exposure: 1.15, toneMapping: "neutral" },
  warm: { exposure: 1, toneMapping: "aces" },
  neutral: { exposure: 0.9, toneMapping: "neutral" },
  soft: { exposure: 0.62, toneMapping: "aces" },
};

let registration: Promise<void> | null = null;

function registerModelViewer(): Promise<void> {
  if (!registration) {
    registration = import("@google/model-viewer").then(() => undefined);
  }
  return registration;
}

export default function ModelViewer({
  src,
  iosSrc,
  alt,
  poster,
  environment = "warm",
  exposure,
  shadowIntensity = 1,
  shadowSoftness = 0.8,
  autoRotate = true,
  cameraControls = true,
  ar = true,
  scale = 1,
  className,
  onReady,
  onModelLoad,
  onArStatusChange,
}: ModelViewerProps) {
  const ref = useRef<ModelViewerElement | null>(null);
  const [state, setState] = useState<"registering" | "loading" | "ready" | "error">(
    "registering",
  );

  useEffect(() => {
    let cancelled = false;
    registerModelViewer()
      .then(() => {
        if (!cancelled) setState("loading");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || state === "registering") return;

    const handleLoad = () => {
      setState("ready");
      onModelLoad?.();
      onReady?.(element);
    };
    const handleError = () => setState("error");

    // A cached model can finish loading before this effect runs, and the `load`
    // event does not replay. Without this check the spinner never clears.
    if ((element as ModelViewerElement & { loaded?: boolean }).loaded) {
      handleLoad();
    }

    const handleArStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status: string }>).detail;
      if (detail?.status) onArStatusChange?.(detail.status);
    };

    element.addEventListener("load", handleLoad);
    element.addEventListener("error", handleError);
    element.addEventListener("ar-status", handleArStatus);
    return () => {
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
      element.removeEventListener("ar-status", handleArStatus);
    };
  }, [state, onModelLoad, onReady, onArStatusChange]);

  // Camera framing is left on "auto" below: model-viewer sizes the shot to the
  // model. A fixed radius looked right for one plate and left every other dish
  // small and stranded in the middle of the frame.
  const preset = ENVIRONMENTS[environment];

  return (
    <div className={cn("relative h-full w-full", className)}>
      {state !== "error" ? (
        // The element is created as soon as registration resolves; before that
        // there is nothing to hydrate into.
        state === "registering" ? null : (
          <model-viewer
            ref={ref as never}
            src={src}
            {...(iosSrc ? { "ios-src": iosSrc } : {})}
            alt={alt}
            {...(poster ? { poster } : {})}
            {...(ar ? { ar: true as const } : {})}
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            {...(cameraControls ? { "camera-controls": true as const } : {})}
            touch-action="pan-y"
            {...(autoRotate ? { "auto-rotate": true as const } : {})}
            auto-rotate-delay={1200}
            rotation-per-second="18deg"
            camera-orbit="30deg 70deg auto"
            min-camera-orbit="auto 0deg auto"
            max-camera-orbit="auto 92deg auto"
            camera-target="auto auto auto"
            field-of-view="28deg"
            exposure={exposure ?? preset.exposure}
            tone-mapping={preset.toneMapping}
            shadow-intensity={shadowIntensity}
            shadow-softness={shadowSoftness}
            interaction-prompt="none"
            loading="eager"
            {...(scale !== 1 ? { scale: `${scale} ${scale} ${scale}` } : {})}
          >
            {/* Claiming the `ar-button` slot replaces model-viewer's own floating
                button. Every surface here supplies a branded one that calls
                `activateAR()`, and two AR buttons on screen is confusing. */}
            <span slot="ar-button" aria-hidden className="hidden" />
          </model-viewer>
        )
      ) : null}

      {state === "registering" || state === "loading" ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
          <LoaderCircle className="h-5 w-5 animate-spin text-sage" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim">Building the view</p>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-6 text-center">
          <TriangleAlert className="h-5 w-5 text-amber" />
          <p className="text-sm font-semibold text-ink">This 3D view would not load</p>
          <p className="max-w-xs text-[12.5px] text-ink-plain">
            The model may still be building. Try again from the dish, or check that 3D is switched on in this browser.
          </p>
        </div>
      ) : null}
    </div>
  );
}
