import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/session";
import { backend, listDishes, listOutbox, listTableCodes } from "@/lib/db";
import { providerStatus } from "@/lib/ar/pipeline";
import { photoStore } from "@/lib/storage/photos";
import { Eyebrow, PageTitle } from "@/components/app/ui";
import SettingsForms from "./SettingsForms";

export const metadata: Metadata = { title: "Settings · Dish360" };

export default async function SettingsPage() {
  const { user, restaurant } = await requireAuth();

  const [dishes, codes, outbox] = await Promise.all([
    listDishes(restaurant.id),
    listTableCodes(restaurant.id),
    // Scoped to this person's address — an unscoped outbox would hand one
    // owner every other owner's email.
    listOutbox(user.email),
  ]);

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
      />
    </div>
  );
}
