# Fingerprints

Every site you build with **scrollcraft** gets one row here, appended after it
ships. The registry exists so your next build can prove it is a different page
rather than a re-skin of one you already made.

This file is **yours**. It starts empty on purpose: the gate is about not
repeating *yourself*, so it has nothing to say until you have built something.

The rules and the gate live in the skill's
`references/uniqueness.md`. Short version:

**A new build must differ from EVERY row below on at least 4 of the 6
dimensions.** Four against each row individually, not four on average across the
table. If a planned build fails, change the plan. Never edit a row to make room
for it.

The six dimensions are: **grammar**, **nav treatment**, **hero device**,
**act-sequence shape**, **close pattern**, **signature move**.

Dimension 6 is free, because a signature move is unique by definition. So the
gate really asks for three more out of the remaining five, and a build that
changes only grammar and world will fail it.

---

## The registry

| Build | Grammar | Nav treatment | Hero device | Act-sequence shape | Close pattern | Signature move | World | Port |
|---|---|---|---|---|---|---|---|---|
| `website /` *(pre-existing, recorded 2026-09-28 from Desktop/Dish360/website)* | Multi-section marketing page (filmic one-shot family) | Floating glass pill bar: wordmark, links, "Book Demo" | Headline + phone mockup with AR dish + floating glass QR card, pointer parallax | 7 stacked sections: hero, workflow, builder, analytics, directory, pricing, FAQ | FAQ accordion + conversion footer | Operable 3D food / AR table inspector in the hero | Dark glass, sage, fluid waves | Next dev :3000 |
| `website /story` *(pre-existing, recorded from website/BRIEF.md)* | Continuous worldflight (Architecture A) | Floating chapter-jump header with room-tone audio | Candlelit dining-room approach to an acrylic QR standee | 5 legs, one continuous flight | Command hub: ROI ledger + printable standee generator | Operable 360° WebAR inspector with view modes and HUD pins | Photoreal candlelit editorial | Next dev :3000/story |

| `a-live-surface` (2026-09-28) | Live surface | App chrome: pipeline-step sidebar is the nav, top status pill, status bar counters | Surface already in state: the menu table, every row "PDF", selection travelling to one dish | 1 pinned surface, 6 phases, ~10.5vh | First-run form (restaurant name, tables) that live-rewrites the standee | A photo becomes a sliced 3D mesh ring by ring, then textures, then turns under the pointer | Dark glass dashboard over fluid waves | :4517/builds/a-live-surface/ |
| `b-split-stage` (2026-09-28) | Split stage | No bar: the divider carries side labels + 5 clickable argument ticks | 50/50: "A list of words." vs "The dish itself.", both readable | 1 pinned act: hero + 4 claims + collapse, ~11vh | Divider wipes the PDF column off-screen, AR takes full width, CTA in it | Scanner beam sweeps each claim, staling PDF lines and lighting AR ones | Flat grey PDF half vs living glass half | :4517/builds/b-split-stage/ |
| `c-typographic-poster` (2026-09-28) | Typographic poster | None: the wordmark is the hero composition | "Dish360" at ~20vw with the 360 in sage halftone | 5 acts pin / flow+kinetic / pin (peak) / flow+reveal / pin, ~10vh | Inversion: smallest type, scannable glass QR, underlined link | Depth-of-field focus pull: letters sharpen in depth order until AR brackets lock | Pure type on drifting dark grounds | :4517/builds/c-typographic-poster/ · **superseded 2026-09-28, archived** |
| `c-how-it-works` (2026-09-28) | Guided walkthrough (natural scroll, sticky picture beside 5 steps) | Order-tracker bar: 5 stops, fills with scroll, ticks, clickable; "Step 2 of 5" on phones | Plain promise left, a burger standing on an AR table the page finds on load, QR card beside it | flow hero, sticky 5-step walk, compare rows, needs, FAQ, close; no pinning, ~10.5vh | Plain CTA band after an FAQ, AR table on the right | Food-delivery tracker metaphor carrying one dish end to end | Dark glass over the AR-surface ground | :4517/builds/c-how-it-works/index.html |

*(The two rows above the dated ones were built before this workspace existed. They are recorded
here so new variants are gated against them, not re-skins of them.)*

---

## What is taken

Add a bullet here whenever a build claims something a later build should avoid
reusing: a grammar, a nav treatment, a close pattern, a signature move, an
act-count-and-length band. The shared columns are what the next build inherits
as a constraint, so writing them down is the whole point.

- **Photo-to-3D moment** is now taken twice over (`/story` leg 2 as the diner's scan, `a-live-surface` as the owner's upload). A next build should not make "the photo becomes 3D" its peak.
- **Rotatable CSS/3D burger** appears in `/`, `/story`, A and B. It is shared brand material now, not a signature.
- **The translucent glass QR card** (design.md §7) appears in every build. It is the brand constant; never a signature move.
- **Single long pinned act driving a bespoke fixed stage** is used by A and B. A next build should prefer engine acts or worldflight.
- **Scanner line as a device** (B). **Focus/blur rack on type** (old C). **App sidebar as nav + form close** (A).
- **Order-tracker as navigation** and **sticky picture + scrolling steps** (new C).
- **AR-surface ground** (a perspective dot plane that is "detected" with progress) now replaces the waves in A, B and C. It is shared brand material across these three, not a signature.

---

## Appending a row

After shipping, add one line to the table and one bullet to **What is taken** if
the build claimed something new. Fill every column. Say what the build shares
with existing rows.

Rows are append-only. A build that has been superseded stays in the table,
because the space it occupies is still occupied.

---

## Worked example

The skill's author kept a registry of twelve builds across eight page grammars.
If you want to see what a filled-in table looks like, and which shapes tend to
collide, read `EXAMPLES.md` in the scrollcraft repository. Treat it as
illustration only: those rows are somebody else's builds and they do **not**
constrain yours.
