/**
 * Chart palette.
 *
 * Deliberately *not* in the `"use client"` chart module: every export of a
 * client module becomes a client-reference proxy in the RSC graph, so a Server
 * Component reading `SERIES.primary` from there would get `undefined`. Plain
 * data lives here, where both sides can read it.
 *
 * The brand's sage (`#aad0af`) is intentionally low-chroma, which reads as grey
 * the moment it has to carry *identity* against a second series. These slots are
 * brand-adjacent hues stepped for the `#131313` stage and validated as a set —
 * lightness band, chroma floor, CVD separation, normal-vision separation and
 * contrast all pass. Sage stays the single-series colour, where identity is not
 * at stake.
 */

export const SERIES = {
  /** categorical slot 1 — green, the house hue */
  primary: "#37a06d",
  /** categorical slot 2 — candlelight amber */
  secondary: "#c47a2e",
  /** categorical slot 3 — slate blue, held for a third series */
  tertiary: "#5a86d6",
} as const;

/** Single-hue ordinal ramp, light → dark, for ordered funnel stages. */
export const ORDINAL = [
  "#cfe9db",
  "#a7d7c0",
  "#7fc4a5",
  "#57b18a",
  "#37a06d",
  "#2b8258",
] as const;

/** The surface marks are ringed against, for the 2px surface ring. */
export const CHART_SURFACE = "#1b1f22";

export const CHART_GRID = "rgba(255,255,255,0.07)";

export const CHART_INK_MUTED = "rgba(229,226,225,0.4)";

/** Negative-direction colour for deltas; not a categorical slot. */
export const NEGATIVE = "#e08585";
