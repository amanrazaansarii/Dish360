import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin";
import { listLeads } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Dish360",
  robots: { index: false, follow: false },
};

// Always the live numbers.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts only checks a cookie exists. Every page and the data loader
  // check again themselves: a layout renders in parallel with its page, so a
  // gate here alone would not stop a page's data being sent.
  const { user } = await requireAdmin();
  const fresh = (await listLeads()).filter((l) => l.status === "new").length;

  return (
    <AdminShell user={{ name: user.name, email: user.email }} newInquiries={fresh}>
      {children}
    </AdminShell>
  );
}
