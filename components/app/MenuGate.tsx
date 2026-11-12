import Link from "next/link";
import { EyeOff } from "lucide-react";

/** What a guest sees when the menu is not open to them. */
export function MenuUnavailable({ name }: { name: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-ink-plain">
          <EyeOff className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
          {name}&apos;s menu is not open right now
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-plain">
          Ask a member of staff for a printed menu. Nothing is wrong with your phone.
        </p>
        <Link href="/" className="mt-6 inline-block text-[13px] font-semibold text-sage hover:underline">
          What is Dish360?
        </Link>
      </div>
    </main>
  );
}

/** The strip an owner sees on their own menu before it is live. */
export function PreviewStrip({ reason }: { reason: "unpublished" | "suspended" }) {
  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-amber-400/[0.92] px-4 py-2 text-center text-[12.5px] font-semibold text-charcoal"
    >
      {reason === "suspended"
        ? "This menu is switched off by Dish360. Only you can see it. Get in touch to turn it back on."
        : "Preview: this menu is not published, so only you can see it. Publish it from Settings."}
    </div>
  );
}
