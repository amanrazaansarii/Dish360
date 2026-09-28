# Variant B: Flat / Alive (Split Stage)

Built 2026-09-28 with the `scroller` skill. Isolated from `Desktop/Dish360`; nothing in the
project was modified. Brand tokens come from `Desktop/Dish360/design.md`.

## Interview (answers as given)

| Stage | Answer |
|---|---|
| Structures for the variant set | Live Surface, Split Stage, Typographic Poster |
| Look | All dark glass (design.md) |
| Assets | Code-only, free |
| Audience | Restaurant owners, CTA "Book a demo" |
| This variant's signature | Scanner-beam divider |
| Typeface | Plus Jakarta Sans |
| Mobile | Responsive: the split turns from left/right into top/bottom below 760px |

## Grammar

**Split stage.** Two columns held in tension for the whole page: the PDF menu restaurants
use today, and the same menu on Dish360. Neither side is a caption; both carry a real claim
at every beat. No nav bar: **the divider is the chrome.** It carries both side labels and
five argument ticks (clickable, they jump to each claim). The close is the collapse: the
divider travels to the left edge, the PDF column is wiped out, and the CTA lives in the
winning column.

Two grounds, one per side, and they hold: the PDF side is a dead flat grey with no
texture and no motion; the AR side is the brand ground with the living wave field and glass.

## Journey and feeling curve

| # | Beat (divider tick) | Emotion | On-screen cause |
|---|---|---|---|
| 0 | Hero | Recognition | 50/50. Left: "A list of words." over a real menu page. Right: "The dish itself." over the rotating 3D dish. Both readable at once |
| 1 | See | Doubt | Left: one menu line describes a burger. Right: the burger, at scale, rotatable |
| 2 | Open | Friction vs ease | Left: find the Wi-Fi, download a PDF, pinch to zoom. Right: the glass QR card; point the camera, it opens in the browser |
| 3 | Update | Control | Left: edit, export, reprint. Right: a working price stepper; the price on the QR card changes as you click |
| 4 | Learn | Quiet | Left: a PDF cannot tell you what people looked at. Right: which dishes diners open (sample data, labelled) |
| 5 | Collapse **(PEAK)** | Relief, decision | The beam sweeps to the left edge, the PDF column wipes away, AR takes the full width: "Your menu, on the table." + Book a demo |

**Peak.** The collapse, with the largest scroll room (about a fifth of the act) and the
only full-width moment on the page. **Silence before it:** beat 4 is the quietest beat, one
sentence per side.
**Tell-someone sentence:** *"it's the site where a scanner line swept down the page and
every line of the PDF menu went dead while the AR side lit up, until the PDF was wiped
off the screen."*

## Signature move

**Scanner-beam divider.** At every beat a horizontal scan line leaves the divider and
sweeps down across both columns. Each line of the PDF side it passes goes grey and stale;
each item on the AR side it passes lights up. Between beats the vertical divider tips a
few percent toward the PDF side, so the balance visibly moves. At the end the beam turns
and sweeps the whole divider to the left edge.

## Device score

One pinned act (span 10). Inside it:

| Beat | Device family |
|---|---|
| Hero | `pin` (greets 50/50) |
| See | `tilt` / pointer drag on the dish |
| Open | `reveal` per side (QR assembles) |
| Update | live control (price stepper) |
| Learn | `count` bars on labelled sample data |
| Collapse | bespoke divider travel (`clip-path` wipe) |

Grammar bans honoured: no `pan`, no `spotlight`, no `magnet`, no `scrub`, no `drift`
(two grounds that hold). Brand exception, earned by design.md: difference-blend cursor.

Page length: about 11 viewport-heights.

## Fingerprint gate

| vs row | Grammar | Nav | Hero | Sequence | Close | Signature | Differs on |
|---|---|---|---|---|---|---|---|
| `website /` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `website /story` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |
| `a-live-surface` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 6 / 6 |

Passes.

## Verification and feel check (2026-09-28)

Harness (`shoot.mjs`, desktop and 390x844): no dead scroll, 0 console errors. Small
print over the wave field lifted to the secondary ink for contrast.

| Beat | Intended | Felt on first cold pass | Change |
|---|---|---|---|
| Hero | Recognition | Recognition | none |
| See | Doubt | Suspense: AR side blurred until the beam lands, then relief | kept, it is stronger than planned |
| Open | Friction vs ease | as intended | none |
| Update | Control | as intended (stepper works) | none |
| Learn | Quiet | Quiet | none |
| Collapse | Relief, decision (peak) | **Nothing**: both sides faded out before the divider moved, so the wipe crossed an empty screen | the last PDF beat now stays on screen until the divider wipes it; divider fades earlier so its ticks never cross the CTA |

Phones: fixed the divider label overprinting the hero kicker, and a squeezed QR card.

## Not used, on purpose

No invented statistics (the "up to 25% AOV" line in the project context is unverified).
Menu prices are sample menu data, labelled as a sample restaurant.

## Revision 2026-09-28: own ground instead of the site's waves

The fluid wave field borrowed from the existing Dish360 site was removed at the
owner's request. The page now stands on this project's own **AR surface**: a
perspective plane of sage dots and faint mesh lines, "detected" outward from a pool of
light the way an AR camera finds a table. Here it lives only on the Dish360 half: every claim the AR side wins detects more of the table, the collapse finds all of it, and its centre follows the divider.
