"use client";

import { useId, useMemo, useRef, useState } from "react";
import { cn, formatCompact } from "@/lib/utils";
import {
  CHART_GRID as GRID,
  CHART_INK_MUTED,
  CHART_SURFACE as SURFACE,
  NEGATIVE,
  ORDINAL,
  SERIES,
} from "@/lib/chart-palette";

/** Chart primitives, hand-rolled in SVG — no charting dependency. */

/* ------------------------------------------------------------ time series --- */

export interface SeriesSpec {
  key: string;
  label: string;
  color: string;
  values: number[];
}

interface TimeSeriesChartProps {
  labels: string[];
  series: SeriesSpec[];
  height?: number;
  /** formats the tooltip and axis values */
  format?: (value: number) => string;
  className?: string;
}

export function TimeSeriesChart({
  labels,
  series,
  height = 220,
  format = (value) => value.toLocaleString(),
  className,
}: TimeSeriesChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const width = 720;
  const padding = { top: 16, right: 16, bottom: 26, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const max = useMemo(() => {
    const peak = Math.max(1, ...series.flatMap((s) => s.values));
    // Round up to a clean tick so the axis labels are readable numbers.
    const magnitude = 10 ** Math.floor(Math.log10(peak));
    return Math.ceil(peak / magnitude) * magnitude;
  }, [series]);

  const count = labels.length;
  const stepX = count > 1 ? plotWidth / (count - 1) : 0;

  const xFor = (index: number) => padding.left + index * stepX;
  const yFor = (value: number) => padding.top + plotHeight * (1 - value / max);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
    value: Math.round(max * fraction),
    y: padding.top + plotHeight * (1 - fraction),
  }));

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const element = wrapperRef.current;
    if (!element || count === 0) return;
    const rect = element.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const x = ratio * width - padding.left;
    const index = Math.round(x / (stepX || 1));
    setHover(Math.min(count - 1, Math.max(0, index)));
  };

  // Sparse x labels — one every ~6 points keeps them from colliding.
  const labelEvery = Math.max(1, Math.ceil(count / 6));

  return (
    <div className={cn("w-full", className)}>
      {series.length > 1 ? (
        <ul className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {series.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-[12px] font-medium text-ink-plain">{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div
        ref={wrapperRef}
        className="relative w-full"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          // Width-driven: the viewBox aspect ratio sets the height, so the plot
          // fills the panel instead of sitting at its native size in the middle.
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${series.map((s) => s.label).join(" and ")} over ${count} days`}
        >
          <defs>
            {series.map((item) => (
              <linearGradient
                key={item.key}
                id={`${uid}-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={item.color} stopOpacity="0.16" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={tick.y}
                y2={tick.y}
                stroke={GRID}
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[10px]"
                fill={CHART_INK_MUTED}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCompact(tick.value)}
              </text>
            </g>
          ))}

          {labels.map((label, index) =>
            index % labelEvery === 0 || index === count - 1 ? (
              <text
                key={label + index}
                x={xFor(index)}
                y={height - 8}
                textAnchor={index === count - 1 ? "end" : index === 0 ? "start" : "middle"}
                className="text-[10px]"
                fill={CHART_INK_MUTED}
              >
                {label}
              </text>
            ) : null,
          )}

          {series.map((item) => {
            const points = item.values.map(
              (value, index) => `${xFor(index)},${yFor(value)}`,
            );
            const areaPath = `M ${padding.left},${padding.top + plotHeight} L ${points.join(
              " L ",
            )} L ${xFor(count - 1)},${padding.top + plotHeight} Z`;
            return (
              <g key={item.key}>
                <path d={areaPath} fill={`url(#${uid}-${item.key})`} />
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {hover !== null ? (
            <>
              <line
                x1={xFor(hover)}
                x2={xFor(hover)}
                y1={padding.top}
                y2={padding.top + plotHeight}
                stroke="rgba(229,226,225,0.28)"
                strokeWidth="1"
              />
              {series.map((item) => (
                <circle
                  key={item.key}
                  cx={xFor(hover)}
                  cy={yFor(item.values[hover] ?? 0)}
                  r="4.5"
                  fill={item.color}
                  stroke={SURFACE}
                  strokeWidth="2"
                />
              ))}
            </>
          ) : null}

          {/* End markers: the one label each series always earns. */}
          {series.map((item) => (
            <circle
              key={`end-${item.key}`}
              cx={xFor(count - 1)}
              cy={yFor(item.values[count - 1] ?? 0)}
              r="4"
              fill={item.color}
              stroke={SURFACE}
              strokeWidth="2"
            />
          ))}
        </svg>

        {hover !== null ? (
          <div
            className="rounded-2xl bg-surface-elevated ring-1 ring-inset ring-white/[0.07] shadow-glass backdrop-blur-xl pointer-events-none absolute top-2 z-10 min-w-[150px] -translate-x-1/2 rounded-xl px-3 py-2.5"
            style={{
              left: `${Math.min(88, Math.max(12, ((xFor(hover) / width) * 100)))}%`,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-dim">
              {labels[hover]}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1">
              {series.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-4 text-[12px]"
                >
                  <span className="flex items-center gap-1.5 text-ink-plain">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-semibold text-ink tabular-nums">
                    {format(item.values[hover] ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- bar list --- */

export interface BarRow {
  id: string;
  label: string;
  value: number;
  /** shown under the label */
  hint?: string;
  href?: string;
}

/**
 * Single-series horizontal bars — magnitude by identity. One hue, so no legend:
 * the section heading already says what is plotted.
 */
export function BarList({
  rows,
  format = (value) => value.toLocaleString(),
  color = SERIES.primary,
  emptyLabel = "Nothing recorded yet",
  className,
}: {
  rows: BarRow[];
  format?: (value: number) => string;
  color?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  if (rows.length === 0) {
    return <p className={cn("text-[13px] text-ink-dim", className)}>{emptyLabel}</p>;
  }

  return (
    <ul className={cn("flex flex-col gap-3.5", className)}>
      {rows.map((row) => (
        <li key={row.id}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-plain">
              {row.label}
            </span>
            <span className="shrink-0 text-[13px] font-semibold text-ink tabular-nums">
              {format(row.value)}
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <span
              className="block h-full rounded-r-[4px]"
              style={{
                width: `${Math.max(2, (row.value / max) * 100)}%`,
                background: color,
              }}
            />
          </div>
          {row.hint ? (
            <p className="mt-1 text-[11px] text-ink-dim">{row.hint}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ funnel --- */

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

/**
 * Ordered stages down a single-hue ramp — the ramp encodes position in the
 * funnel, the bar length encodes the count.
 */
export function Funnel({
  stages,
  className,
}: {
  stages: FunnelStage[];
  className?: string;
}) {
  const top = Math.max(1, stages[0]?.value ?? 1);

  return (
    <ol className={cn("flex flex-col gap-2.5", className)}>
      {stages.map((stage, index) => {
        const share = stage.value / top;
        const previous = stages[index - 1]?.value;
        const stepRate =
          previous && previous > 0 ? (stage.value / previous) * 100 : null;
        const colour = ORDINAL[Math.min(ORDINAL.length - 1, index + 1)];

        return (
          <li key={stage.id}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-medium text-ink-plain">{stage.label}</span>
              <span className="flex items-baseline gap-2.5">
                {stepRate !== null ? (
                  <span className="text-[11px] text-ink-dim tabular-nums">
                    {stepRate.toFixed(0)}% of previous
                  </span>
                ) : null}
                <span className="text-[13px] font-semibold text-ink tabular-nums">
                  {stage.value.toLocaleString()}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <span
                className="block h-full rounded-r-[4px]"
                style={{
                  width: `${Math.max(2, share * 100)}%`,
                  background: colour,
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------- stat tile --- */

export function StatTile({
  label,
  value,
  delta,
  hint,
  spark,
  className,
}: {
  label: string;
  value: string;
  /** signed percentage change against the previous period */
  delta?: number;
  hint?: string;
  spark?: number[];
  className?: string;
}) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className={cn("rounded-2xl bg-surface-elevated ring-1 ring-inset ring-white/[0.07] shadow-glass backdrop-blur-xl px-5 py-4", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
        {label}
      </p>
      {/* Proportional figures: tabular-nums makes a display-size number look loose. */}
      <p className="mt-1.5 text-[28px] font-bold leading-none text-ink">{value}</p>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div>
          {delta !== undefined ? (
            <p
              className="text-[12px] font-semibold"
              style={{ color: positive ? SERIES.primary : NEGATIVE }}
            >
              {positive ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
            </p>
          ) : null}
          {hint ? <p className="mt-0.5 text-[11.5px] text-ink-dim">{hint}</p> : null}
        </div>

        {spark && spark.length > 1 ? <Sparkline values={spark} /> : null}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const width = 72;
  const height = 24;
  const max = Math.max(1, ...values);
  const stepX = width / (values.length - 1);
  const points = values
    .map((value, index) => `${index * stepX},${height - (value / max) * height}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke="rgba(229,226,225,0.28)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={width}
        cy={height - (values[values.length - 1] / max) * height}
        r="2.5"
        fill={SERIES.primary}
      />
    </svg>
  );
}
