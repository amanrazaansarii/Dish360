# Variant C: How It Works (Guided Walkthrough)

Built with the `scroller` skill. Replaces the earlier typographic-poster C (archived in
`archive/`, not published). Isolated from the Next.js app: plain HTML/CSS/JS.

## Brief (the owner's words)

> "Replace variant C by creating one more variant that stays somewhere in between
> variant A and B, in such a way that it is easy to understand and scroll through for
> the people who are not very familiar with high-tech, while also explaining our end
> to end function and mechanism of service."

Carried over from the first interview: dark glass brand (colours, logo, QR card,
cursor), code-only assets, restaurant owners as the audience, Plus Jakarta Sans.
Waves from the existing project are not used; the ground is this project's own AR
surface (see below).

## How it sits between A and B

| From A (live surface) | From B (split stage) |
|---|---|
| The real mechanism, step by step: photo, 3D model, table code, guest view, dashboard | A plain "today vs with Dish360" comparison |
| Working controls: price stepper, sold-out switch, real QR, PNG download | Two sides of the same service: what **you** do and what **your guest** sees |

What it drops from both: no scroll-jacking, no pinned acts, no jargon (no "WebAR",
".glb", "mesh"). AR is explained once in one sentence. Body type is larger (~18px).

## Grammar

**Guided walkthrough** (a named variant of chaptered editorial): natural document
scroll, one sticky picture beside five short steps, every step labelled with who does
it (You / We / Your guest). Chrome is an order tracker, not a nav bar of links.

## Journey and feeling curve

| # | Section | Emotion | Cause |
|---|---|---|---|
| 1 | Hero | Recognition | One sentence of promise, a burger standing on a table the page "finds" as it loads |
| 2 | Step 1, photo | Ease | "Use your phone." A camera frame, three ticks, "Photo sent" |
| 3 | Step 2, 3D | Wonder (peak) | The burger builds itself, shape then colour, then "Approved" |
| 4 | Step 3, table code | Confidence | A real QR on a stand, downloadable |
| 5 | Step 4, guest | Delight | The dish lands on the guest's table inside their phone |
| 6 | Step 5, control | Control | Change the price or mark sold out; the guest card changes with it |
| 7 | Compare, needs, FAQ | Reassurance | Plain rows, three things you need, four honest answers |
| 8 | Close | Intent | "See your own dishes on the table." Book a demo |

**Tell-someone sentence:** *"it's the site that explains the whole thing like tracking
a food delivery: one burger goes from your phone, to 3D, to the table code, to your
guest's table, and the tracker ticks each stop."*

## Signature move

**The order tracker.** The fixed bar is the food-delivery tracker everyone already
knows how to read: five stops (Photo, 3D model, Table code, Guest scans, You update), a
line that fills continuously as you scroll, a tick at each stop once its step is half
read, and every stop clickable. On phones it becomes "Step 2 of 5 · 3D model". The same
burger is carried through every scene of the sticky picture, so the reader follows one
dish end to end.

## Device score

`flow + in` (hero, compare, needs, FAQ, close) · bespoke sticky scene stage driven by
step progress (published as `data-sc-verify-state`) · `reveal`-style staggered rows ·
pointer (drag the dish, stepper, switches). No `pin`, no `scrub`, no `pan`.
Page length: about 10 to 11 viewport-heights.

## Fingerprint gate

| vs row | Grammar | Nav | Hero | Sequence | Close | Signature | Differs on |
|---|---|---|---|---|---|---|---|
| `website /` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `website /story` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `a-live-surface` | ✓ | ✓ (tracker vs app sidebar) | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `b-split-stage` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |

## Honesty

Dishes and prices are samples, stated in the footer and on the dashboard. The "most
viewed" bars are labelled sample data. No invented statistics. FAQ answers only state
what the product documents say (browser-based, iPhone and Android, no app).
