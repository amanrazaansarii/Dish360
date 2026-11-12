"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  CreditCard,
  Gauge,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu as MenuIcon,
  Store,
  Tags,
  X,
} from "lucide-react";
import { signOutAction } from "@/app/(account)/actions";
import { cn } from "@/lib/utils";

/**
 * The frame around the admin panel: Dish360's own control room, separate from
 * any one restaurant's dashboard.
 */

const NAV = [
  { href: "/admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/billing", label: "Revenue & billing", icon: CreditCard },
  { href: "/admin/pricing", label: "Plans & pricing", icon: Tags },
  { href: "/admin/assets", label: "3D & API costs", icon: Boxes },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: true },
  { href: "/admin/outbox", label: "Outbox", icon: Mail },
] as const;

export default function AdminShell({
  user,
  newInquiries,
  children,
}: {
  user: { name: string; email: string };
  newInquiries: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
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
            {"badge" in item && item.badge && newInquiries > 0 ? (
              <span className="rounded-full bg-sage px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-charcoal">
                {newInquiries}
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
        href="/dashboard"
        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] text-ink-plain transition-colors hover:bg-white/[0.05] hover:text-ink"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        My demo café&apos;s dashboard
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

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
        <path d="M8 25.6C8 17.9 13.4 12.8 20 12.8S32 17.9 32 25.6Z" fill="#e9e5dc" />
        <rect x="6.4" y="24.9" width="27.2" height="2.8" rx="1.4" fill="#e9e5dc" />
        <circle cx="20" cy="10.3" r="2" fill="#e9e5dc" />
        <path d="M27.98 32.3A17 6 0 0 0 36.63 25.75" fill="none" stroke="#aad0af" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4.03 24.95A17 6 0 0 0 18.2 32.97" fill="none" stroke="#e9e5dc" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="text-[15px] font-bold tracking-tight text-ink">
        Dish360 <span className="font-semibold text-sage">admin</span>
      </span>
    </Link>
  );

  return (
    <div className="relative flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r border-white/[0.06] bg-background/70 p-5 backdrop-blur-xl lg:flex">
        {brand}
        <div className="flex-1">{nav}</div>
        {foot}
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-background/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          {brand}
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
