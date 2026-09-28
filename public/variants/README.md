# Dish360 landing-page variants

Three landing-page variants to pick from, built with the `scroller` skill. They are plain
static HTML/CSS/JS inside `public/`, so they sit beside the Next.js site without touching
it: no component, route, style or dependency of the app was changed.

## Preview

```bash
npm run dev
```

Then open **http://localhost:3000/variants/index.html** and pick a variant. On a Vercel
preview deployment of this branch the same path works: `<preview-url>/variants/index.html`.
(Next serves `public/` files by exact path, so keep the `index.html` in the URL.)

| | Variant | Structure | The moment |
|---|---|---|---|
| A | `builds/a-live-surface/` | The page is the Dish360 Studio dashboard, running | A photo becomes a 3D mesh, ring by ring |
| B | `builds/b-split-stage/` | Your PDF menu vs Dish360, side by side | A scanner line stales the PDF and wipes it away |
| C | `builds/c-how-it-works/` | Guided walkthrough in plain words, normal scroll | An order tracker ticks off one burger's journey, photo to table |

Each build has a `BRIEF.md`: the brief, feeling curve, peak, signature move and how it
differs from the others. `FINGERPRINTS.md` records every build, including the existing
`/` and `/story` pages of this site.

## Background

None of the variants reuse the wave field from the existing site. They share their own
ground: an **AR surface**, a perspective plane of sage dots and faint mesh lines that is
"detected" outward from a pool of light, the way a phone's AR camera finds a table. How
much of the table is found follows each page's story (A: the pipeline, B: each claim the
AR side wins, C: the walkthrough). It is batched into ~24 draw calls a frame, pauses when
off screen and idles at ~20fps.

Kept from the brand: the logo, colours (charcoal `#131313`, sage `#aad0af` / `#8fb495`,
oyster `#e5e2e1`), the dark glass feel, the translucent QR card and the difference-blend
cursor from `design.md`.

## What is real, what is sample

- **Real:** the QR codes (a built-in encoder, round-trip tested with jsQR) and they open
  dish360.in; the 3D burger (a CSS-3D object, drag or arrow keys to rotate); the price
  steppers and sold-out switches; Download PNG / Copy link; A's live standee preview.
- **Sample, labelled on the page:** the restaurant, dishes, prices, uploaded file and the
  "most viewed" rankings.
- **Not claimed:** no statistics (the unverified "AOV up to 25%" is not used).
- The glass card draws its QR sage-on-dark (inverted), as `design.md` specifies. Most
  phone cameras read it; the downloadable PNGs are standard dark-on-white for print.

## Structure

- `index.html` the chooser
- `builds/<variant>/index.html` each page; beside it `brand.css` / `brand.js` (tokens,
  glass QR card, cursor, AR ground), `qr.js`, `dish3d.js`, the scrollcraft engine
  (`scrollcraft.js/.css`) and `assets/logo.png`. Each folder is self-contained.

To move a winner into the app later, the page logic is one inline script per variant and
ports into a client component with `useEffect`.
