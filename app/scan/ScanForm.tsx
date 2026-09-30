"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, QrCode, TriangleAlert } from "lucide-react";
import { Button, FieldLabel, FIELD, GlassCard, Lede } from "@/components/app/ui";
import { cn } from "@/lib/utils";

/**
 * For when the camera will not read the code: a worn stand, a cracked lens, a
 * phone with the QR reader switched off. The code is printed in small type at
 * the bottom of every stand for exactly this.
 */
export default function ScanForm({ notice }: { notice: string | null }) {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <GlassCard className="w-full max-w-md p-8 sm:p-10">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sage/[0.15]">
        <QrCode className="h-5 w-5 text-sage" />
      </span>

      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-ink">
        Type your table code
      </h1>
      <Lede className="mt-2">
        It is printed in small type at the bottom of the stand on your table.
      </Lede>

      {notice ? (
        <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-amber-400/[0.1] px-4 py-3.5 text-[12.5px] leading-relaxed text-amber-200">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {notice}
        </p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = code.trim().toUpperCase();
          if (trimmed) router.push(`/t/${encodeURIComponent(trimmed)}`);
        }}
        className="mt-7 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="code">Table code</FieldLabel>
          <input
            id="code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            placeholder="CPL-T04"
            className={cn(
              FIELD,
              "py-4 text-center font-mono text-lg uppercase tracking-[0.12em]",
            )}
          />
        </div>

        <Button type="submit" size="lg" disabled={!code.trim()} className="w-full">
          Open the menu
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-[12.5px] text-ink-dim">
        No code to hand?{" "}
        <Link href="/menus" className="font-semibold text-sage hover:underline">
          Browse the menus
        </Link>
      </p>
    </GlassCard>
  );
}
