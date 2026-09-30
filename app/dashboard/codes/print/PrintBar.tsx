"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

/** The toolbar above the stands. `.no-print` keeps it off the paper. */
export default function PrintBar({ count, size }: { count: number; size: string }) {
  const params = useSearchParams();
  const code = params.get("code");

  const href = (next: string) => {
    const search = new URLSearchParams();
    if (code) search.set("code", code);
    search.set("size", next);
    return `/dashboard/codes/print?${search.toString()}`;
  };

  return (
    <div className="no-print sticky top-0 z-50 border-b border-white/[0.06] bg-background/90 px-5 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/codes"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-dim transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Table codes
          </Link>
          <p className="text-[13px] text-ink-plain">
            {count} stand{count === 1 ? "" : "s"} ready
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {(["a6", "a5"] as const).map((option) => (
              <Link
                key={option}
                href={href(option)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[12px] font-semibold uppercase transition-colors",
                  size === option
                    ? "bg-sage/[0.16] text-sage"
                    : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.1]",
                )}
              >
                {option}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-sage-solid px-5 py-2.5 text-[13px] font-semibold text-charcoal shadow-[0_4px_16px_rgba(143,180,149,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform hover:scale-[1.04]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        </div>
      </div>

      <p className="mx-auto mt-3 max-w-4xl text-[11.5px] leading-relaxed text-ink-dim">
        In the print box, choose &ldquo;Save as PDF&rdquo;, set margins to none, and turn
        off headers and footers. Each stand comes out at its true size with trim marks —
        hand the PDF to a print shop, or run it on card at home and cut to the marks.
      </p>
    </div>
  );
}
