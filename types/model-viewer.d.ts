import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * `<model-viewer>` is a custom element registered at runtime by
 * `@google/model-viewer`.
 *
 * React needs the element declared or the attributes we set are silently
 * dropped instead of type-checked. React 18 reads the *global* JSX namespace,
 * which is why this is written this way rather than as a `declare module
 * "react"` augmentation.
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          src?: string;
          "ios-src"?: string;
          alt?: string;
          poster?: string;
          ar?: boolean | "";
          "ar-modes"?: string;
          "ar-scale"?: "auto" | "fixed";
          "ar-placement"?: "floor" | "wall";
          "camera-controls"?: boolean | "";
          "touch-action"?: string;
          "auto-rotate"?: boolean | "";
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          "camera-orbit"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          exposure?: number | string;
          "shadow-intensity"?: number | string;
          "shadow-softness"?: number | string;
          "environment-image"?: string;
          "skybox-image"?: string;
          "tone-mapping"?: string;
          "interaction-prompt"?: string;
          "disable-zoom"?: boolean | "";
          "disable-pan"?: boolean | "";
          "disable-tap"?: boolean | "";
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "manual" | "interaction";
          scale?: string;
          "animation-name"?: string;
          autoplay?: boolean | "";
        },
        HTMLElement
      >;
    }
  }
}

/** The part of the element we actually call into. */
export interface ModelViewerElement extends HTMLElement {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  exposure: number;
  shadowIntensity: number;
  shadowSoftness: number;
  autoRotate: boolean;
  loaded?: boolean;
  canActivateAR: boolean;
  activateAR(): Promise<void>;
  resetTurntableRotation(theta?: number): void;
  getCameraOrbit(): { theta: number; phi: number; radius: number };
  getDimensions(): { x: number; y: number; z: number };
}
