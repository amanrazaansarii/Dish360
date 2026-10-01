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
  db/             two backends, one repository layer: a JSON file or Supabase
  storage/        where a dish photograph goes, by the same split
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

There are two complete backends behind one set of function signatures, and
nothing above `lib/db/index.ts` knows which is live:

| | |
|---|---|
| `lib/db/local/` | a JSON file under `.data/`, seeded on first use |
| `lib/db/remote/` | Supabase |
| `lib/storage/photos.ts` | the same split for photographs: `public/uploads/` or a Supabase Storage bucket |

Which one runs is decided by the environment, not by a flag in code:

```
DATA_BACKEND=local | supabase    decides outright, if set
otherwise                        Supabase when its keys are present, else local
```

**The local store refuses to serve production traffic.** It writes to a disk,
and a serverless host either has none or throws it away between requests — the
app would look fine and then lose everything. So a production request with no
Supabase keys fails loudly instead, naming what is missing. `next build` is
exempt: a build is not a deployment, and the project still builds with no keys
at all. `DATA_BACKEND=local` is the opt-in for a VPS or a container that really
does have a persistent disk.

### Going live on Supabase

1. Run `supabase/migrations/0001_dish360.sql` against the project — SQL Editor,
   or `supabase db push`. It creates the eleven tables, the `bump_scan`
   function, and the `dish-photos` storage bucket.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
3. Open `/api/db-check` signed in as an owner. It checks every table, the
   function and the bucket, and names anything missing. `/api/db-check?write=1`
   also puts one throwaway row in and takes it out again, which is the only way
   to know writes work.

Settings shows which backend is live, so this is visible without reading logs.

**On the keys.** `SUPABASE_SERVICE_ROLE_KEY` has no `NEXT_PUBLIC_` prefix on
purpose — Next inlines any `NEXT_PUBLIC_` variable into the browser bundle, and
this key bypasses every row-level policy. Row-level security is enabled on all
eleven tables with no policies attached, so the service role reaches the data
and the anon key reaches nothing. Keep it out of the repository: see
`.env.example`.

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
   `queueMail` in `lib/db/local/repository.ts` and `lib/db/remote/repository.ts`.
3. **Payments.** Switching plan applies its limits immediately and bills
   nothing. Gate `changePlanAction` behind a provider's webhook before charging.
4. **Photographs.** Until a dish has one, the menu shows a drawing coloured from
   its flavour sliders — deliberately not a grey box, but not a photo either.
   Uploading works; the photos are yours to take.

Smaller ones:

- **`AUTH_SECRET` must be set before deploying.** Without it the session cookie
  is signed with a documented development fallback.
- **Supabase is written but unverified.** `lib/db/remote/` implements every
  repository function against the schema in `supabase/migrations/`, and the
  migration has not been run anywhere yet — so that code has never executed.
  Run it, then `/api/db-check?write=1`, before trusting a deployment. Until
  then the local store is what is actually proven.
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
