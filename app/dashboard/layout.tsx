import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/session";
import { listOrders } from "@/lib/db";
import DashboardShell from "@/components/app/DashboardShell";
import { planFor } from "@/lib/platform";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts only checks the cookie exists. This is the real gate.
  const auth = await getAuth();
  if (!auth) redirect("/signin?next=/dashboard");

  const waiting = (await listOrders(auth.restaurant.id, "new")).length;
  const plan = await planFor(auth.restaurant.plan);

  return (
    <DashboardShell
      user={{ name: auth.user.name, email: auth.user.email }}
      place={{
        name: auth.restaurant.name,
        slug: auth.restaurant.slug,
        planName: plan.name,
        published: auth.restaurant.published,
        suspended: auth.restaurant.suspended,
      }}
      admin={auth.admin}
      acting={auth.acting}
      waitingOrders={waiting}
    >
      {children}
    </DashboardShell>
  );
}
