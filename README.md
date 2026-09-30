# Dish360

Photos of your dishes become 3D. Guests scan a code on the table and the food
appears in front of them through their phone camera. No app to download.

Next.js 14 · React 18 · Tailwind CSS 3.

```bash
npm install
npm run dev     # http://localhost:3000
```

The first request writes sample content into `.data/dish360.json` — a café with
a full menu, ten table codes and a month of traffic — so every screen has
something real on it straight away. Delete that file to start clean.

**Sign in to try it:** `owner@copperleaf.test` / `dish360demo`

---

## What is where

### The home page is static

`/` is served from `public/home/index.html` by a `beforeFiles` rewrite in
`next.config.mjs`. It is plain HTML, CSS and JS with no framework runtime:

| File | |
|---|---|
| `index.html` | the page itself |
| `scrollcraft.css/js` | the scroll engine |
| `brand.css/js` | the brand layer — tokens, glass, the QR card, the cursor |
| `dish3d.js` | the burger you can drag, drawn on one canvas |
| `qr.js` | a real QR encoder, so the card on the page is a working code |

`/variants` holds the alternates. `app/page.tsx` and `components/*` are the
earlier React landing page — still in the tree, no longer shown.

**None of the above is touched by the product code.** The app screens read their
design from the same tokens in `brand.css`, but they are separate files.

### The product

The home page makes five promises. Each one has a screen behind it:

| Step | Promise | Where |
|---|---|---|
| 1 | Take a photo of each dish | `/dashboard/menu` |
| 2 | We turn it into 3D — *you check it before any guest sees it* | `/dashboard/menu/<dish>` |
| 3 | Put a code on every table | `/dashboard/codes` |
| 4 | Your guest scans and sees the dish | `/t/<code>` → `/m/<slug>` → `/view/<dish>` |
| 5 | Change anything, any time | `/dashboard/menu`, `/dashboard/insights` |

Other routes: `/signin` `/signup` `/forgot-password` `/menus` `/scan`
`/dashboard/orders` `/dashboard/settings`.

```
lib/
  types.ts        the domain
  dish.ts         when a dish is visible, and when its 3D is
  db/             a local JSON store behind a repository layer
  auth/           scrypt hashing, signed session cookies
  ar/             geometry → GLB and USDZ, and the build pipeline
  qr/             codes as PNG and vector, for print
  analytics.ts    counting up the raw events
components/app/   every app screen's parts
middleware.ts     keeps signed-out visitors off the dashboard
```

---

## Two things worth knowing

**The 3D is built here, with no third party.** `lib/ar/` builds a real,
true-to-scale mesh from the dish record and writes it out as glTF binary and as
USDZ — the latter a 64-byte-aligned store ZIP around an ASCII USD file, which is
what iPhones read. Both writers are in this repo. That is why 3D works on iPhone
and Android today without an account anywhere.

Setting `MODEL_PROVIDER=3daistudio` and a key switches the pipeline to building
models from the actual photographs instead. Nothing else changes; if that
service is down the built-in one takes over rather than leaving a dish with no
model at all.

**A model is not visible just because it exists.** The home page says *"You
check every dish and approve it before any guest sees it"*, so `approved` is a
separate flag the owner controls. Until they press release, guests see the photo
and cannot open the dish in 3D — and rebuilding sends it back for checking,
because the owner approved the last model, not the new one. The owner can always
load their own unreleased model; nobody else can.

---

## Storage

`lib/db/store.ts` is the only file that touches the disk. Everything else talks
to the repository in `lib/db/index.ts`, which returns plain objects. Moving to
Supabase means rewriting the bodies in that one file — no screen imports the
store.

`.env.local` already holds Supabase keys, but `@supabase/supabase-js` is not
installed and nothing reads them yet.

---

## What still needs you

Everything built works. These four cannot be finished without a key, a
credential, or a decision that is yours:

1. **3D from your photographs.** The built-in builder makes a recognisable,
   correctly-sized dish from the record, and the whole flow works on top of it.
   Turning an actual *photo* into a mesh needs a 3D AI Studio key. Check the
   request and response shapes in `lib/ar/pipeline.ts` against your plan the
   first time you run it.
2. **Email.** Password resets and welcome messages are kept in an outbox, shown
   under Settings, instead of being sent. Connecting a provider means replacing
   `queueMail` in `lib/db/index.ts`.
3. **Payments.** Switching plan applies its limits immediately and bills
   nothing. Gate `changePlanAction` behind a provider's webhook before charging.
4. **Photographs.** Until a dish has one, the menu shows a drawing coloured from
   its flavour sliders — deliberately not a grey box, but not a photo either.
   Uploading works; the photos are yours to take.

Smaller ones:

- **`AUTH_SECRET` must be set before deploying.** Without it the session cookie
  is signed with a documented development fallback.
- **Files on disk.** Photos go to `public/uploads/` and the store writes to
  `.data/`, which suits one server or a container with a volume. A host with no
  persistent disk needs `app/api/upload/route.ts` pointed at object storage and
  the store swapped for a database.
- **`npm run lint` does not run.** `eslint.config.mjs` is a flat config from a
  newer scaffold that Next 14's `next lint` cannot read, and
  `eslint-config-next` is not installed. This predates the product code; the
  build's own type check passes. Fixing it means either adding the dependency or
  moving back to `.eslintrc`.
- **`npm audit` reports two issues** in Next 14 itself and its bundled postcss.
  `npm audit fix --force` would pull Next 16, which would mean migrating
  Tailwind and React too.

---

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build, with the type check
npm start        # serve the build
```

`npx tsc --noEmit` type-checks on its own.
