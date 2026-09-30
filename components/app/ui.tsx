import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The small set of pieces every app screen is built from.
 *
 * These match `public/home/brand.css` on purpose — the same glass recipe, the
 * same sage CTA, the same resolved text colours — so the dashboard and the
 * guest menu read as the same product as the home page.
 */

/* ------------------------------------------------------------- surfaces --- */

export function Panel({
  children,
  className,
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  /** for deep links, e.g. /dashboard/menu/<id>#three-d */
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={cn(
        "rounded-2xl bg-surface/80 shadow-glass ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** The deeper, floatier glass — brand.css `.glass`, used for cards that lift. */
export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl shadow-glass-elevated ring-1 ring-inset ring-white/[0.07] backdrop-blur-[24px]",
        "bg-[rgba(30,34,38,0.55)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** An inset well — a quieter area inside a panel. */
export function Well({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- buttons --- */

type Variant = "sage" | "ghost" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-[15px]",
};

function variantClasses(variant: Variant): string {
  switch (variant) {
    case "sage":
      // brand.css .btn-sage
      return cn(
        "bg-sage-solid text-charcoal font-semibold",
        "shadow-[0_4px_16px_rgba(143,180,149,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]",
        "hover:scale-[1.04] active:scale-[0.97]",
      );
    case "ghost":
      // brand.css .btn-ghost
      return cn(
        "bg-white/[0.06] text-ink font-medium",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        "hover:bg-white/[0.1] active:scale-[0.97]",
      );
    case "danger":
      return "bg-red-500/[0.15] text-red-200 font-medium hover:bg-red-500/25 active:scale-[0.97]";
    case "quiet":
    default:
      return "text-ink-plain font-medium hover:bg-white/[0.06] hover:text-ink";
  }
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap " +
  "transition-[transform,background-color,box-shadow,color] duration-150 ease-out " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Button({
  variant = "sage",
  size = "md",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(BASE, SIZES[size], variantClasses(variant), className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "sage",
  size = "md",
  className,
  children,
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
}) {
  const classes = cn(BASE, SIZES[size], variantClasses(variant), className);

  // Next's Link cannot handle external or mailto targets.
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/* ----------------------------------------------------------------- text --- */

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.2em] text-ink-dim",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PageTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-[clamp(1.9rem,4vw,2.6rem)] font-extrabold leading-[1.08] tracking-tight text-ink",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-[15px] font-semibold text-ink", className)}>{children}</h2>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[14px] leading-relaxed text-ink-plain", className)}>
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------- bits --- */

type Tone = "neutral" | "sage" | "amber" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/[0.07] text-ink-plain",
  sage: "bg-sage/[0.16] text-sage",
  amber: "bg-amber-400/[0.16] text-amber-200",
  danger: "bg-red-500/[0.16] text-red-200",
};

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function FieldLabel({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-dim"
    >
      <span>{children}</span>
      {hint ? (
        <span className="text-[11px] font-normal normal-case tracking-normal text-ink-dim">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export const FIELD =
  "w-full rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-ink " +
  "ring-1 ring-inset ring-white/[0.08] placeholder:text-ink-dim " +
  "transition-shadow duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-sage/60 " +
  "disabled:opacity-50";

export function ErrorNote({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-[13px] font-medium text-red-300">
      {children}
    </p>
  );
}

export function DoneNote({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="status" className="text-[13px] font-medium text-sage">
      {children}
    </p>
  );
}

export function Empty({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl bg-white/[0.03] px-8 py-14 text-center ring-1 ring-inset ring-white/[0.06]",
        className,
      )}
    >
      {icon ? (
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-sage/[0.15] text-sage">
          {icon}
        </span>
      ) : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      {body ? <p className="max-w-sm text-sm text-ink-plain">{body}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/**
 * A relative time that is safe inside a Client Component.
 *
 * "3 min ago" comes from the clock, so the server's value and the browser's at
 * hydration can differ by a minute. The clock is external state, which is what
 * suppressHydrationWarning is for.
 */
export function TimeAgo({
  iso,
  className,
}: {
  iso: string | null;
  className?: string;
}) {
  if (!iso) return <span className={className}>never</span>;
  return (
    <time dateTime={iso} className={className} suppressHydrationWarning>
      {relative(iso)}
    </time>
  );
}

function relative(iso: string): string {
  const diff = Date.now() - Date.parse(iso);
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
