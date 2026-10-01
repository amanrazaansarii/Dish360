"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Download, ExternalLink, Globe, LoaderCircle, Mail } from "lucide-react";
import {
  changePasswordAction,
  changePlanAction,
  togglePublishedAction,
  updateHoursAction,
  updatePlaceAction,
  updateProfileAction,
  type ActionState,
} from "@/app/dashboard/actions";
import {
  Button,
  DoneNote,
  ErrorNote,
  FieldLabel,
  FIELD,
  Lede,
  Panel,
  SectionTitle,
  Tag,
  TimeAgo,
  Well,
} from "@/components/app/ui";
import { PLANS } from "@/lib/plans";
import { DAY_NAMES, cn } from "@/lib/utils";
import type { OutboxMessage, Restaurant } from "@/lib/types";

const EMPTY: ActionState = {};

export default function SettingsForms({
  restaurant,
  user,
  counts,
  provider,
  storage,
  outbox,
}: {
  restaurant: Restaurant;
  user: { name: string; email: string; role: string };
  counts: { dishes: number; codes: number };
  provider: { label: string; connected: boolean; note: string };
  storage: { data: "local" | "supabase"; photos: "disk" | "supabase" };
  outbox: OutboxMessage[];
}) {
  const [placeState, placeAction] = useFormState(updatePlaceAction, EMPTY);
  const [profileState, profileAction] = useFormState(updateProfileAction, EMPTY);
  const [passwordState, passwordAction] = useFormState(changePasswordAction, EMPTY);

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------ publishing --- */}
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionTitle className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-sage" />
              Your menu on the web
            </SectionTitle>
            <Lede className="mt-1.5">
              {restaurant.published ? (
                <>
                  Live at{" "}
                  <Link
                    href={`/m/${restaurant.slug}`}
                    target="_blank"
                    className="font-medium text-sage hover:underline"
                  >
                    /m/{restaurant.slug}
                    <ExternalLink className="ml-1 inline h-3 w-3" />
                  </Link>
                  , and listed for people looking nearby.
                </>
              ) : (
                "Not published yet. Your table codes still work, but nobody can find you by searching."
              )}
            </Lede>
          </div>

          <form action={togglePublishedAction}>
            <Button
              type="submit"
              variant={restaurant.published ? "ghost" : "sage"}
              size="md"
            >
              {restaurant.published ? "Take it down" : "Publish it"}
            </Button>
          </form>
        </div>
      </Panel>

      {/* ----------------------------------------------------------- place --- */}
      <Panel className="p-6">
        <form action={placeAction}>
          <SectionTitle>Your place</SectionTitle>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <input
                id="name"
                name="name"
                required
                defaultValue={restaurant.name}
                className={FIELD}
              />
              <ErrorNote>{placeState.fieldErrors?.name}</ErrorNote>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="slug" hint="the address guests land on">
                /m/…
              </FieldLabel>
              <input
                id="slug"
                name="slug"
                required
                defaultValue={restaurant.slug}
                className={FIELD}
              />
              <ErrorNote>{placeState.fieldErrors?.slug}</ErrorNote>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <FieldLabel htmlFor="tagline">One line about it</FieldLabel>
            <input
              id="tagline"
              name="tagline"
              defaultValue={restaurant.tagline}
              placeholder="Breakfast till close."
              className={FIELD}
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <FieldLabel htmlFor="about">A short paragraph</FieldLabel>
            <textarea
              id="about"
              name="about"
              rows={3}
              defaultValue={restaurant.about}
              className={cn(FIELD, "resize-y leading-relaxed")}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="cuisine" hint="separated by commas">
                What you serve
              </FieldLabel>
              <input
                id="cuisine"
                name="cuisine"
                defaultValue={restaurant.cuisine.join(", ")}
                placeholder="Café, All-day breakfast"
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="city">City</FieldLabel>
              <input
                id="city"
                name="city"
                defaultValue={restaurant.city}
                className={FIELD}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <input
              id="address"
              name="address"
              defaultValue={restaurant.address}
              className={FIELD}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <input
                id="phone"
                name="phone"
                defaultValue={restaurant.phone}
                className={FIELD}
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="website">Website</FieldLabel>
              <input
                id="website"
                name="website"
                defaultValue={restaurant.website}
                placeholder="https://"
                className={FIELD}
              />
            </div>
          </div>

          <div className="mt-5 max-w-xs">
            <BrandColour value={restaurant.brandColor} />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Save label="Save" />
            <DoneNote>{placeState.done}</DoneNote>
            <ErrorNote>{placeState.error}</ErrorNote>
          </div>
        </form>
      </Panel>

      {/* ----------------------------------------------------------- hours --- */}
      <Panel className="p-6">
        <form action={updateHoursAction}>
          <SectionTitle>When you are open</SectionTitle>
          <Lede className="mt-1.5">
            Shown on your menu, so someone reading it at home knows when to come.
          </Lede>

          <div className="mt-5 flex flex-col gap-2.5">
            {restaurant.hours.map((entry) => (
              <div
                key={entry.day}
                className="grid grid-cols-[104px_1fr_1fr_auto] items-center gap-3"
              >
                <span className="text-[13px] font-medium text-ink-plain">
                  {DAY_NAMES[entry.day]}
                </span>
                <input
                  type="time"
                  name={`open.${entry.day}`}
                  defaultValue={entry.open}
                  aria-label={`${DAY_NAMES[entry.day]} opening time`}
                  className={cn(FIELD, "px-3 py-2 text-[13px]")}
                />
                <input
                  type="time"
                  name={`close.${entry.day}`}
                  defaultValue={entry.close}
                  aria-label={`${DAY_NAMES[entry.day]} closing time`}
                  className={cn(FIELD, "px-3 py-2 text-[13px]")}
                />
                <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-dim">
                  <input
                    type="checkbox"
                    name={`closed.${entry.day}`}
                    defaultChecked={entry.closed}
                    className="h-4 w-4 accent-[#8fb495]"
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Save label="Save the hours" />
          </div>
        </form>
      </Panel>

      {/* ------------------------------------------------------------ plan --- */}
      <Panel id="plan" className="scroll-mt-24 p-6">
        <SectionTitle>Your plan</SectionTitle>
        <Lede className="mt-1.5">
          Limits apply the moment you switch. Nothing is billed here — talk to us to sort
          out the money side.
        </Lede>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const current = plan.id === restaurant.plan;
            const tooManyDishes =
              plan.dishLimit !== null && counts.dishes > plan.dishLimit;
            const tooManyCodes =
              plan.tableCodeLimit !== null && counts.codes > plan.tableCodeLimit;

            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl p-5",
                  current ? "bg-sage/[0.12] ring-1 ring-inset ring-sage/30" : "bg-white/[0.03]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink">{plan.name}</p>
                  {current ? <Tag tone="sage">Yours</Tag> : null}
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-plain">
                  {plan.summary}
                </p>

                <ul className="mt-4 flex flex-1 flex-col gap-1.5">
                  {plan.allows.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[12.5px] text-ink-plain"
                    >
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-sage" />
                      {line}
                    </li>
                  ))}
                </ul>

                {current ? (
                  <p className="mt-4 text-[12.5px] text-sage">
                    {counts.dishes} dishes · {counts.codes} codes
                  </p>
                ) : (
                  <form action={changePlanAction} className="mt-4">
                    <input type="hidden" name="plan" value={plan.id} />
                    <button
                      type="submit"
                      disabled={tooManyDishes || tooManyCodes}
                      className="w-full rounded-full bg-white/[0.08] px-4 py-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Switch to {plan.name}
                    </button>
                    {tooManyDishes || tooManyCodes ? (
                      <p className="mt-2 text-[11px] text-amber-200">
                        You have more {tooManyDishes ? "dishes" : "codes"} than this one
                        allows.
                      </p>
                    ) : null}
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* --------------------------------------------------------- account --- */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-6">
          <form action={profileAction}>
            <SectionTitle>You</SectionTitle>
            <Lede className="mt-1.5">Signed in as the {user.role}.</Lede>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                <input
                  id="profile-name"
                  name="name"
                  required
                  defaultValue={user.name}
                  className={FIELD}
                />
                <ErrorNote>{profileState.fieldErrors?.name}</ErrorNote>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="profile-email">Email</FieldLabel>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  required
                  defaultValue={user.email}
                  className={FIELD}
                />
                <ErrorNote>{profileState.fieldErrors?.email}</ErrorNote>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Save label="Save" />
              <DoneNote>{profileState.done}</DoneNote>
            </div>
          </form>
        </Panel>

        <Panel className="p-6">
          <form action={passwordAction}>
            <SectionTitle>Password</SectionTitle>
            <Lede className="mt-1.5">
              Changing it does not sign you out anywhere else.
            </Lede>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="currentPassword">The one you use now</FieldLabel>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={FIELD}
                />
                <ErrorNote>{passwordState.fieldErrors?.currentPassword}</ErrorNote>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="newPassword" hint="8 characters or more">
                  The new one
                </FieldLabel>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className={FIELD}
                />
                <ErrorNote>{passwordState.fieldErrors?.newPassword}</ErrorNote>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <Save label="Change it" />
              <DoneNote>{passwordState.done}</DoneNote>
            </div>
          </form>
        </Panel>
      </div>

      {/* ---------------------------------------------------- what's wired --- */}
      <Panel className="p-6">
        <SectionTitle>What is connected</SectionTitle>

        <div className="mt-5 flex flex-col gap-4">
          <Wired
            title="Where your menu is kept"
            status={storage.data === "supabase" ? "Supabase" : "This machine"}
            connected={storage.data === "supabase"}
            detail={
              storage.data === "supabase"
                ? "Your menu, codes and numbers live in your Supabase database. Photographs go to Supabase Storage."
                : "Everything is in a file on this computer. That is fine while you are trying it out, but a deployed site usually has no disk to write to — connect Supabase before putting this online."
            }
            action={
              <a
                href="/api/db-check"
                target="_blank"
                rel="noreferrer"
                className="text-[12px] font-semibold text-sage hover:underline"
              >
                Check the connection
              </a>
            }
          />
          <Wired
            title="Building the 3D"
            status={provider.label}
            connected={provider.connected}
            detail={provider.note}
          />
          <Wired
            title="Email"
            status="Not connected"
            connected={false}
            detail="Password resets and welcome messages are kept in the outbox below instead of being sent. Connect an email provider to deliver them."
          />
          <Wired
            title="Payments"
            status="Not connected"
            connected={false}
            detail="Switching plan applies straight away and is not billed. Connect a payment provider before charging anyone."
          />
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2.5 text-[12.5px] font-semibold text-ink transition-colors hover:bg-white/[0.1]"
          >
            <Download className="h-3.5 w-3.5" />
            Download everything
          </a>
          <p className="mt-2 text-[11.5px] text-ink-dim">
            Your place, your menu, your codes and your numbers, as one file. The 3D
            models download from each dish.
          </p>
        </div>
      </Panel>

      {/* --------------------------------------------------------- outbox --- */}
      {outbox.length > 0 ? (
        <Panel className="p-6">
          <SectionTitle className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-ink-dim" />
            Waiting to be sent
          </SectionTitle>
          <Lede className="mt-1.5">
            Messages Dish360 would have emailed you. They are here because no email
            provider is connected.
          </Lede>

          <ul className="mt-5 flex flex-col gap-2.5">
            {outbox.map((message) => (
              <li key={message.id}>
                <Well className="px-4 py-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink">
                      {message.subject}
                    </p>
                    <TimeAgo iso={message.createdAt} className="text-[11px] text-ink-dim" />
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed text-ink-plain">
                    {message.body}
                  </p>
                </Well>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}

function BrandColour({ value }: { value: string }) {
  const [colour, setColour] = useState(value);
  return (
    <div className="flex flex-col gap-2">
      <FieldLabel htmlFor="brandColor" hint="on your menu">
        Your colour
      </FieldLabel>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          aria-label="Pick your colour"
          className="h-11 w-14 cursor-pointer rounded-xl border-0 bg-transparent p-0"
        />
        <input
          id="brandColor"
          name="brandColor"
          value={colour}
          onChange={(e) => setColour(e.target.value)}
          className={cn(FIELD, "flex-1 font-mono uppercase")}
        />
      </div>
    </div>
  );
}

function Wired({
  title,
  status,
  connected,
  detail,
  action,
}: {
  title: string;
  status: string;
  connected: boolean;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <Well className="px-4 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        <Tag tone={connected ? "sage" : "neutral"}>{status}</Tag>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-plain">{detail}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </Well>
  );
}

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="md" disabled={pending}>
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : label}
    </Button>
  );
}
