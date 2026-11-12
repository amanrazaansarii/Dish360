import { requireAdmin } from "@/lib/auth/admin";
import { listAllOutbox } from "@/lib/db";
import { PageHead } from "@/components/admin/bits";
import { Panel, TimeAgo } from "@/components/app/ui";

export const metadata = { title: "Outbox · Dish360 admin" };

export default async function AdminOutbox() {
  await requireAdmin("/admin/outbox");
  const mail = await listAllOutbox(200);
  return (
    <div className="flex flex-col gap-6">
      <PageHead
        title="Outbox"
        lede="Every email Dish360 would have sent: welcomes, password-reset links. No email service is connected yet, so they wait here. If an owner is locked out, their reset link is here to pass on."
      />
      {mail.length === 0 ? (
        <Panel className="p-8 text-center text-[13px] text-ink-dim">Nothing yet.</Panel>
      ) : (
        <ul className="flex flex-col gap-3">
          {mail.map((m) => (
            <li key={m.id}>
              <Panel className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink">{m.subject}</p>
                  <span className="text-[12px] text-ink-dim">
                    to {m.to} · <TimeAgo iso={m.createdAt} />
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line break-words text-[13px] leading-relaxed text-ink-plain">{m.body}</p>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
