import type { Metadata } from "next";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { listOrders } from "@/lib/db";
import { setOrderStatusAction } from "@/app/dashboard/actions";
import {
  Button,
  Empty,
  Eyebrow,
  Lede,
  PageTitle,
  Panel,
  Tag,
  Well,
} from "@/components/app/ui";
import { cn, formatMoney, formatRelativeTime } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Orders · Dish360" };

const TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "new", label: "Waiting" },
  { id: "accepted", label: "In the kitchen" },
  { id: "served", label: "Served" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "Everything" },
];

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "accepted", label: "Take it" },
  accepted: { status: "served", label: "Served" },
};

const LABELS: Record<OrderStatus, string> = {
  new: "Waiting",
  accepted: "In the kitchen",
  served: "Served",
  cancelled: "Cancelled",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const { restaurant } = await requireAuth();

  const active = TABS.some((t) => t.id === searchParams.status)
    ? (searchParams.status as OrderStatus | "all")
    : "new";

  const all = await listOrders(restaurant.id);
  const shown = active === "all" ? all : all.filter((o) => o.status === active);

  const counts = {
    new: all.filter((o) => o.status === "new").length,
    accepted: all.filter((o) => o.status === "accepted").length,
    served: all.filter((o) => o.status === "served").length,
    cancelled: all.filter((o) => o.status === "cancelled").length,
    all: all.length,
  };

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Eyebrow>Sent from the dish a guest was looking at</Eyebrow>
        <PageTitle className="mt-2">Orders</PageTitle>
        <Lede className="mt-1.5 max-w-2xl">
          When a guest taps order while looking at a dish, it arrives here with their
          table number. This is a nudge for the floor, not a replacement for your till.
        </Lede>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/dashboard/orders?status=${tab.id}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-semibold transition-colors",
              active === tab.id
                ? "bg-sage/[0.16] text-sage"
                : "bg-white/[0.05] text-ink-plain hover:bg-white/[0.1]",
            )}
          >
            {tab.label}
            <span className="tabular-nums opacity-60">{counts[tab.id]}</span>
          </Link>
        ))}
      </div>

      {shown.length === 0 ? (
        <Empty
          icon={<Receipt className="h-5 w-5" />}
          title={active === "new" ? "Nothing waiting" : "Nothing here"}
          body="Orders a guest sends from a dish land here, with the table they are sitting at."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((order) => {
            const next = NEXT[order.status];
            return (
              <li key={order.id}>
                <Panel className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-[16px] font-bold text-ink">
                          Table {order.tableNumber ?? "—"}
                        </p>
                        <Tag
                          tone={
                            order.status === "new"
                              ? "amber"
                              : order.status === "cancelled"
                                ? "danger"
                                : "sage"
                          }
                        >
                          {LABELS[order.status]}
                        </Tag>
                        <span className="text-[11.5px] text-ink-dim">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>

                      <ul className="mt-3 flex flex-col gap-1.5">
                        {order.items.map((item) => (
                          <li
                            key={item.dishId}
                            className="flex items-baseline justify-between gap-4 text-[13.5px]"
                          >
                            <span className="text-ink-plain">
                              <span className="font-semibold tabular-nums text-ink">
                                {item.quantity} ×
                              </span>{" "}
                              {item.name}
                            </span>
                            <span className="shrink-0 tabular-nums text-ink-dim">
                              {formatMoney(
                                item.priceMinor * item.quantity,
                                order.currency,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {order.note ? (
                        <Well className="mt-3 px-3.5 py-2.5">
                          <p className="text-[12.5px] italic text-ink-plain">
                            &ldquo;{order.note}&rdquo;
                          </p>
                        </Well>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <p className="text-[18px] font-bold tabular-nums text-ink">
                        {formatMoney(order.totalMinor, order.currency)}
                      </p>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {next ? (
                          <form action={setOrderStatusAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value={next.status} />
                            <Button type="submit" size="sm">
                              {next.label}
                            </Button>
                          </form>
                        ) : null}

                        {order.status !== "cancelled" && order.status !== "served" ? (
                          <form action={setOrderStatusAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="cancelled" />
                            <button
                              type="submit"
                              className="rounded-full px-3.5 py-2 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-red-300"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <form action={setOrderStatusAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="status" value="new" />
                            <button
                              type="submit"
                              className="rounded-full px-3.5 py-2 text-[12.5px] font-medium text-ink-dim transition-colors hover:text-ink"
                            >
                              Put it back
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
