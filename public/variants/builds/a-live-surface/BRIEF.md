# Variant A: Dish360 Studio (Live Surface)

Built 2026-09-28 with the `scroller` skill. Isolated from `Desktop/Dish360`; nothing in the
project was modified. Brand tokens come from `Desktop/Dish360/design.md`.

## Interview (answers as given)

| Stage | Answer |
|---|---|
| Structures for the variant set | Live Surface (SaaS demo), Split Stage (PDF vs AR), plus Typographic Poster added in round 2 |
| Look across variants | All dark glass (design.md) |
| Asset source | Code-only, free. No API keys, no generated media |
| Audience | Restaurant owners. Primary action: book a demo |
| This variant's peak | Photo lifts into 3D |
| Typeface | Plus Jakarta Sans (named in the project's own `--font-sans`) |
| Mobile | Responsive CSS (no video, so no portrait render chain is needed) |

Context read before building: `website/PROJECT_MASTER_CONTEXT.md`, `website/BRIEF.md`,
`experimental/README.md`, `website/app/page.tsx`, `design.md`.

## Grammar

**Live surface.** The page is the Dish360 restaurant dashboard, running. App chrome replaces
marketing chrome: a sidebar of pipeline steps is the navigation, a top bar carries the
workspace and pipeline status, a status bar counts what is done. The close is a first-run
input, not a button island.

Honesty rule: every panel is real markup computing its state from data arrays in the page.
The workspace is labelled on its face as a demo with a sample restaurant. The QR code is a
real, scannable code generated in the page. The 3D dish is a real CSS-3D object built from
slices, and it can actually be rotated. It is labelled as a stylised preview, not a
generated `.glb`.

## Journey and feeling curve

| # | Phase (sidebar step) | Emotion | On-screen cause |
|---|---|---|---|
| 1 | Menu | Recognition | Their menu as a table. Every row says `PDF`, every 3D cell is empty. The empty state says diners see menu.pdf |
| 2 | Upload | Anticipation | One row is selected, a flat photo of the dish arrives, an upload bar fills under the hand, the log starts writing |
| 3 | 3D model **(PEAK)** | Awe | The photo tilts back and dissolves into a mesh of sage rings that builds bottom to top, then fills with colour, then turns. The pointer can grab it |
| 4 | QR standee | Control | The translucent glass QR card assembles column by column. It is a real code; the inspector says so and offers a PNG download |
| 5 | Diner view | Relief | The same dish lands on a table inside a phone, AR brackets lock, `Placed on table` |
| 6 | Go live | Resolve | A first-run field with a caret in it. Typing the restaurant's name rewrites the QR card and the phone header live |

**Peak.** Phase 3, the largest share of scroll (about a third of the act).
**Silence before it:** phase 2 is deliberately small (one row, one bar, a quiet log).
**Tell-someone sentence:** *"it's the site where I scrolled a flat burger photo into a 3D
model, ring by ring, and then spun it with my mouse."*

## Signature move

**Photo to mesh to model, in the owner's own dashboard.** Scroll drives two published
parameters on the model: `mesh` (sage wire rings appear bottom to top) and `texture`
(rings fill with colour top to bottom). Then scroll and pointer share the turntable.
It is the same promise the product makes (upload a photo, get a 3D model), shown as the
owner's action rather than the diner's.

## Device score

One pinned surface (span 9.5) holds while its state advances. Inside it, phase by phase:

| Phase | Device family |
|---|---|
| Menu | `pin` (surface greets in state) |
| Upload | `count` (upload %, sample file size) |
| 3D model | bespoke build driven from `--sc-p` + pointer drag |
| QR standee | `reveal` (column wipe of a real QR) |
| Diner view | `parallax` (dish drops onto the table plane) |
| Go live | live input (pointer/keyboard) |

Grammar bans honoured: no `scrub`, no `kinetic`, no `spotlight`, no `drift` (one ground).
Brand exception, earned by design.md: the difference-blend custom cursor and the fluid wave
background (behind the app window only).

Page length: about 10.5 viewport-heights.

## Fingerprint gate

| vs row | Grammar | Nav | Hero | Sequence | Close | Signature | Differs on |
|---|---|---|---|---|---|---|---|
| `website /` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `website /story` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |

Passes (needs 4 of 6 against every row).

## Verification and feel check (2026-09-28)

Harness (`shoot.mjs`, 1440x900 and 390x844): no dead scroll, 0 console errors, 0 failed
requests. Contrast is not graded on this build (no engine cues; state is published through
`data-sc-verify-state`). Muted text was set to ~4.5:1 against the glass by hand.

| Phase | Intended | Felt on first cold pass | Change |
|---|---|---|---|
| Menu | Recognition | Recognition | none |
| Upload | Anticipation | Anticipation | none |
| 3D model | Awe (peak) | Awe: the wire rings are the biggest change on the sheet | none |
| QR standee | Control | Control | none |
| Diner view | Relief | Relief | none |
| Go live | Resolve | Flat: form floated mid-panel under a dead gap | anchored form and card to the top, card enlarged |

Also fixed: on phones the step strip now follows the active step.

## Not used, on purpose

- No invented statistics. `PROJECT_MASTER_CONTEXT.md` mentions "AOV up to 25%"; it is
  unverified, so it is not on the page. Every number shown is labelled sample data or is a
  progress readout of the demo itself.
- No em dashes in visible copy; no filler verbs.

## Revision 2026-09-28: own ground instead of the site's waves

The fluid wave field borrowed from the existing Dish360 site was removed at the
owner's request. The page now stands on this project's own **AR surface**: a
perspective plane of sage dots and faint mesh lines, "detected" outward from a pool of
light the way an AR camera finds a table. Here the table is found as the pipeline runs (12% at the menu, all of it at go-live), and the app glass was made slightly more transparent so it shows through.
