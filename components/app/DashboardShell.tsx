"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ExternalLink,
  LogOut,
  Menu as MenuIcon,
  QrCode,
  Receipt,
  Settings,
  Utensils,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/(account)/actions";
import { Tag } from "./ui";
import { PLAN_LABELS, cn } from "@/lib/utils";
import type { PlanId } from "@/lib/types";

/**
 * The frame around every dashboard screen.
 *
 * The sections follow the five steps on the home page, in the same order, so an
 * owner who read the page finds the thing they were promised where they expect
 * it: the menu, the codes, what guests did, and the orders that came of it.
 */

const NAV = [
  { href: "/dashboard", label: "Today", icon: BarChart3, exact: true },
  { href: "/dashboard/menu", label: "Your menu", icon: Utensils },
  { href: "/dashboard/codes", label: "Table codes", icon: QrCode },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt, badge: true },
  { href: "/dashboard/insights", label: "What guests look at", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export default function DashboardShell({
  user,
  place,
  waitingOrders,
  children,
}: {
  user: { name: string; email: string };
  place: { name: string; slug: string; plan: PlanId; published: boolean };
  waitingOrders: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer when the route changes. Adjusted during render rather than
  // in an effect, so the new screen never paints with it still open.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] transition-colors duration-150",
              active
                ? "bg-sage/[0.16] font-semibold text-sage"
                : "font-medium text-ink-plain hover:bg-white/[0.05] hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="flex-1">{item.label}</span>
            {"badge" in item && item.badge && waitingOrders > 0 ? (
              <span className="rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-charcoal">
                {waitingOrders}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  const foot = (
    <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4">
      <Link
        href={`/m/${place.slug}`}
        target="_blank"
        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-plain transition-colors hover:bg-white/[0.05] hover:text-ink"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        See what guests see
      </Link>

      <div className="rounded-xl bg-white/[0.03] px-3.5 py-3">
        <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
        <p className="truncate text-[11.5px] text-ink-dim">{user.email}</p>
        <form action={signOutAction} className="mt-2.5">
          <button
            type="submit"
            className="flex items-center gap-2 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-red-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-white/[0.06] bg-background/70 p-5 backdrop-blur-xl lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/brand/dish360-logo-new.png"
            alt=""
            width={30}
            height={30}
            className="rounded-full"
            unoptimized
          />
          <span className="text-[15px] font-bold tracking-tight text-ink">Dish360</span>
        </Link>

        <div className="rounded-2xl bg-white/[0.03] px-3.5 py-3">
          <p className="truncate text-[13.5px] font-semibold text-ink">{place.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag tone="sage">{PLAN_LABELS[place.plan]}</Tag>
            <Tag tone={place.published ? "neutral" : "amber"}>
              {place.published ? "Live" : "Not published"}
            </Tag>
          </div>
        </div>

        <div className="flex-1">{nav}</div>
        {foot}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/brand/dish360-logo-new.png"
              alt=""
              width={26}
              height={26}
              className="rounded-full"
              unoptimized
            />
            <span className="text-sm font-bold tracking-tight text-ink">Dish360</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close the menu" : "Open the menu"}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-plain transition-colors hover:bg-white/[0.06] hover:text-ink"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-b border-white/[0.06] bg-background/95 px-4 py-4 backdrop-blur-xl lg:hidden">
            {nav}
            <div className="mt-4">{foot}</div>
          </div>
        ) : null}

        <main className="px-4 py-7 sm:px-7 lg:px-9 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
