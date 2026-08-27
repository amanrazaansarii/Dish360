# DISH360 — Scroller Brief (BRIEF.md)

## 1. Project Master Meta
- **Brand:** Dish360
- **Domain:** B2B2C WebAR Interactive Dining SaaS
- **Primary Audience:** Restaurant Owners, Hospitality Groups, Diners
- **Grammar Archetype:** **Live Surface (SaaS Engine)** — The page behaves like an operable product, with live 3D viewports, telemetry counters, and interactive studio demo states.
- **Visual World:** **Photorealistic 3D Food & Translucent Glass HUD** — Dark luxury claymorphism/glassmorphism stage (`#131313` charcoal), translucent glass panels (`blur(24px)` + lit hairlines), soft sage accents (`#AAD0AF` / `#8FB495`), living fluid canvas waves, and film grain.
- **Signature Move:** **Move A: Live Operable 3D Food & AR Table Inspector** — Interactive 3D dish model responsive to cursor tilt and scroll progression, featuring toggleable wireframe/textured modes, nutritional HUD tags, and dynamic live QR scan simulation.

---

## 2. Design Tokens & Typography Floor
- **Canvas Base:** `#131313` (Warm Deep Charcoal)
- **Surface Glass:** `rgba(30, 34, 38, 0.65)` (`backdrop-filter: blur(24px) saturate(1.3)`)
- **Raised Surface:** `rgba(32, 36, 40, 0.75)`
- **Primary Ink:** `#E5E2E1` (Warm Off-White)
- **Soft Ink:** `rgba(229, 226, 225, 0.6)`
- **Muted Ink:** `rgba(229, 226, 225, 0.4)`
- **Primary Accent:** `#8FB495` / `#AAD0AF` (Natural Sage Green)
- **Accent Glow:** `rgba(170, 208, 175, 0.25)`
- **Headlines:** `Inter` (900/Black, tight tracking) with halftone text dot fills (`.text-halftone`, `.text-halftone-accent`) and Gaussian depth-of-field blurs.
- **Accents:** `Instrument Serif` / `Plus Jakarta Sans`.
- **Body:** `Inter` (300/400).

---

## 3. The Narrative Journey & Feeling Curve

| Act | Scene / Section | Device Family | Emotion / Goal | Felt Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Act 1** | **Hero & AR Inspector** | `tilt` + `kinetic` + `magnet` | Intrigue & Astonishment | "This is not a regular landing page; it's a living WebAR surface." |
| **Act 2** | **4-Step AI Workflow** | `flow` + `reveal` + `spotlight` | Clarity & Simplicity | "Converting 2D food photos to WebAR takes 30 seconds." |
| **Act 3 (Peak)** | **Interactive 3D Studio** | `live-tool` + `pin` + `tilt` | Mastery & Empowerment | "I can customize my own 3D menu and test AR right now." |
| **Act 4** | **Telemetry & ROI Ledger**| `count` + `drift` | Economic Conviction | "Replacing paper menus will save money and boost order size by 25%." |
| **Act 5** | **Public Menu Directory** | `pan` + `reveal` | Desire & Appetite | "Diners will love browsing these realistic 3D dishes." |
| **Act 6** | **Pricing Matrix** | `flow` + `spotlight` | Actionable Confidence | "Clear, high-ROI tiers with instant onboarding." |
| **Act 7** | **FAQ & Luxury Close** | `flow` + `kinetic` | Reassurance & Closure | "Zero hardware hurdles, instant scan-and-go." |

---

## 4. The Engineered Peak & The "Tell Someone" Sentence
- **The Peak:** The **Interactive 3D Menu Builder Studio (Act 3)** where restaurant operators can toggle 3D dish presets, tweak lighting environments, inspect wireframes, and generate downloadable table standees live.
- **The Tell-Someone Sentence:** *"It is the site where you can inspect real 3D dishes, test lighting, and generate an instant WebAR table standee directly in your browser."*

---

## 5. Non-Negotiable Invariants
1. **Translucent Futuristic QR Card:** Preserved verbatim with 5x5 sage scan matrix, lit top hairline highlight, and live AR scan simulator.
2. **Custom Blend Cursor:** Desktop hardware-accelerated circle with `mix-blend-mode: difference` and element-sensing scale expansion.
3. **Fluid Wave Canvas:** Continuous backdrop with 3 stacked harmonic waves reacting to scroll dampening.
