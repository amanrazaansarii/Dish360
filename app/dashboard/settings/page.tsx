import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { backend, listDishes, listLeads, listOutbox, listTableCodes } from "@/lib/db";
import { settings } from "@/lib/platform";
import { providerStatus } from "@/lib/ar/pipeline";
import { photoStore } from "@/lib/storage/photos";
import { Eyebrow, PageTitle } from "@/components/app/ui";
import SettingsForms from "./SettingsForms";

export const metadata: Metadata = { title: "Settings · Dish360" };

export default async function SettingsPage() {
  const { user, restaurant } = await requireAuth();

  const [dishes, codes, outbox, platform, leads] = await Promise.all([
    listDishes(restaurant.id),
    listTableCodes(restaurant.id),
    // Scoped to this person's address — an unscoped outbox would hand one
    // owner every other owner's email.
    listOutbox(user.email),
    settings(),
    listLeads(),
  ]);
  const open = leads.find(
    (l) =>
      l.source === "upgrade" &&
      l.restaurantId === restaurant.id &&
      (l.status === "new" || l.status === "contacted"),
  );

  return (
    <div className="flex flex-col gap-7">
      <header>
        <Eyebrow>{restaurant.name}</Eyebrow>
        <PageTitle className="mt-2">Settings</PageTitle>
      </header>

      <SettingsForms
        restaurant={restaurant}
        user={{ name: user.name, email: user.email, role: user.role }}
        counts={{ dishes: dishes.length, codes: codes.length }}
        provider={providerStatus()}
        storage={{ data: backend, photos: photoStore() }}
        outbox={outbox.slice(0, 10)}
        plans={platform.plans}
        currency={platform.currency}
        requestedPlan={open?.requestedPlan ?? null}
      />
    </div>
  );
}
