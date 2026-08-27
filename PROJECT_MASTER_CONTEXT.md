# DISH360 — Master Project Specification & AI Agent Context

> **Instructions for AI Agents:** This document contains the complete, authoritative context, vision, architecture, design system, technical stack, progress status, and roadmap for **Dish360**. Use this file as your single source of truth when continuing development, generating code, building new features, or refactoring existing modules.

---

## 1. Executive Summary & Vision

**Dish360** is a next-generation B2B2C Software-as-a-Service (SaaS) platform built for premium restaurants, food halls, and hospitality brands. It replaces traditional paper and flat PDF menus with frictionless, interactive **WebAR (Augmented Reality)** dining experiences.

### Core Business Model & Value Proposition
* **For Restaurants (B2B):**
  * Subscription SaaS model (Tiered: Free with ads/watermark, Pro, Enterprise).
  * Increases average order value (AOV) by up to 25% through visual appetite stimulation.
  * Reduces food waste and return rates by letting diners preview exact dish sizing and ingredients.
  * Zero hardware investment: uses existing smartphones via table QR code standees.
* **For Diners / Customers (B2C):**
  * **Zero App Download:** Scans a QR code on the dining table to instantly launch WebAR in iOS Safari (Quick Look USDZ) or Android Chrome (Google Model-Viewer / WebXR).
  * View true-to-scale 3D models of dishes directly on their table before ordering.
  * Filter dishes by dietary restrictions, view calorie counts, ratings, and ingredient breakdowns.

---

## 2. Product Architecture & Core Modules

The Dish360 application consists of four interconnected core modules:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              DISH360 PLATFORM                           │
└────┬────────────────────┬────────────────────┬────────────────────┬─────┘
     │                    │                    │                    │
┌────▼─────────────┐ ┌────▼─────────────┐ ┌────▼─────────────┐ ┌────▼─────────────┐
│ 1. Sales Engine  │ │ 2. Management    │ │ 3. Discovery     │ │ 4. WebAR         │
│    Landing Page  │ │    Dashboard     │ │    Directory     │ │    Viewing Engine│
│                  │ │                  │ │                  │ │                  │
│ • Hero Section   │ │ • Restaurant Auth│ │ • Public Menu    │ │ • Model Viewer   │
│ • 3D Builder     │ │ • 2D-to-3D AI    │ │ • Search & Filter│ │ • iOS USDZ       │
│ • Workflow       │ │ • QR Generator   │ │ • Dish Cards     │ │ • Android WebXR  │
│ • Pricing        │ │ • Analytics      │ │ • Restaurant Hub │ │ • Quick AR launch│
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Module Breakdown

#### 1. Sales Engine (Landing Page) — Current Active Focus
* High-converting, visually stunning web showcase designed to sell Dish360 to restaurant owners.
* Claymorphic 3D visual language, custom fluid canvas animations, GSAP ScrollTrigger timeline, interactive 3D phone mockup, and floating QR preview.

#### 2. Restaurant Management Dashboard (`/dashboard`)
* **Auth & Profile:** Restaurant registration, branding configuration (logo, colors).
* **Menu Management:** CRUD operations for dishes (Name, Category, Price, Ingredients, Calories, Allergens).
* **2D-to-3D AI Conversion Engine:** Integration with 3D AI Studio API to generate 3D `.glb` models from uploaded 2D food photos automatically.
* **QR Code & Standee Exporter:** Generates branded, high-resolution QR table codes and downloadable PDF standee templates.
* **Analytics:** Scans per dish, AR view duration, popular items, conversion metrics.

#### 3. Discovery Layer (`/directory` & `/menu/[restaurant_slug]`)
* Web-based public directory allowing users to discover restaurants nearby and browse full interactive 3D menus online prior to visiting.

#### 4. Frictionless WebAR Engine (`/ar/[dish_id]`)
* Minimalist, ultra-fast WebAR launcher optimized for mobile networks (4G/5G).
* Dynamically detects OS to serve `.glb` via `<model-viewer>` (Android/Desktop) or `.usdz` via iOS AR Quick Look.

---

## 3. Technology Stack & Library Specifications

| Category | Technology / Library | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) + React 19 | Server & Client Components, TypeScript strict mode |
| **Styling** | Tailwind CSS v4 + Custom SVG Filters | Halftone textures, Gaussian motion blurs, glassmorphism backdrop blurs |
| **Animation Engine** | GSAP 3.15 + ScrollTrigger | Smooth scroll-driven section transitions, timeline choreographies |
| **Micro-Animations**| Framer Motion 12 | Mouse-parallax physics (`useSpring`, `useMotionValue`), hover interactions |
| **Canvas Graphics** | HTML5 2D Canvas Context | Viewport-fixed multi-layered fluid wave background (`FluidBackground`) |
| **3D Rendering** | `@google/model-viewer` v4.2 | WebGL 3D rendering, WebXR AR engine, shadow intensity, camera controls |
| **Backend & Auth** | Supabase (PostgreSQL + RLS) | Database schemas, Auth (OAuth + Email), Storage Buckets (`models/`, `images/`) |
| **AI 3D Pipeline** | 3D AI Studio API | Automated 2D image to 3D mesh GLB transformation API |
| **QR Engine** | Canvas / `qrcode.js` | Vector & PNG QR generation with custom embedded logos |

---

## 4. Design System & Aesthetic Guidelines

Dish360 adheres to a strict **Dark Luxury Claymorphic** aesthetic. It must feel extremely worked on, sleek, modern, and instantly impressive.

### Color Palette

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Background Dark** | `#131313` / `#16191C` | Primary dark canvas background |
| **Secondary Dark** | `#1A1D21` / `#202428` | Card backgrounds, phone frame, modal surfaces |
| **Accent Sage (Primary)**| `#8FB495` / `#728C72` | Buttons, CTAs, highlight badges, active states |
| **Soft Sage Glow** | `#AAD0AF` | Text accents, subtle glows, AR highlights |
| **Neutral Cream** | `#E5E2E1` / `#F5F5ED` | Primary typography, headlines, active icons |
| **Slate Charcoal** | `#2A3744` / `#2F3E46` | Backdrop waves, secondary borders, gradient stops |

### Typography Hierarchy
* **Primary Font:** `Inter` (Sans-Serif, Weights 300 to 900).
* **Optional Accent Font:** `Playfair Display` or `The Silver Editorial Serif` (used selectively for editorial dining feel).
* **Headlines:** Ultra-bold / Black (`font-black`), tracking tight (`tracking-tight`), text-halftone effects, motion blur filters (`feGaussianBlur`).

### UI Invariants & Principles
1. **Glassmorphism:** Multi-layered backdrops with `backdrop-filter: blur(20px) saturate(1.3)` and subtle 1px inner borders (`border: 1px solid rgba(255,255,255,0.05)`).
2. **Custom Cursor:** Non-blocking `mix-blend-mode: difference` white circular cursor with smooth hover scaling over interactive elements.
3. **Responsive Mobile First Navigation:** Floating rounded pill navbar (`fixed top-0`, `z-50`), transforms smoothly into a mobile drawer on smaller viewports.
4. **Performance Safety:** Fallbacks for low-power devices, asset preloading (`eager` load on hero images), and progressive 3D mesh resolution.

---

## 5. Repository & Project Structure

```
Dish360/
├── environment/
│   ├── preview-app/             # Active Next.js 16 Application
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout (Inter font, dark theme)
│   │   │   ├── page.tsx         # Main landing page route
│   │   │   └── globals.css      # Custom Tailwind styles & halftone utility classes
│   │   ├── components/
│   │   │   └── Hero.tsx         # Master Landing Page Hero component
│   │   ├── public/
│   │   │   ├── dish360 logo.png # Official brand logo
│   │   │   └── assets/
│   │   │       ├── hero-burger.png
│   │   │       ├── models/      # 3D GLB/USDZ models storage
│   │   │       └── reference/   # Original design specifications & mockups
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── assets/
│   │   └── reference/           # Original visual design spec files:
│   │       ├── homepage.png     # Full desktop landing design reference
│   │       ├── 3d builder.png   # Dashboard 3D builder reference
│   │       ├── analytics and qr.png # QR card & analytics widget reference
│   │       ├── menu.png         # Public menu directory reference
│   │       ├── colorpallet.png  # Master color palette reference
│   │       ├── workflow.png     # How it works workflow reference
│   │       └── font inspiration*.jpg # Editorial typographic guidelines
│   ├── Hero.tsx                 # Root backup copy of Hero component
│   └── PROJECT_MASTER_CONTEXT.md # This document
```

---

## 6. Current Implementation State & Features Built

### Completed Features (Hero Section Phase)
* **Fluid Canvas Background:** Interactive 2D HTML5 canvas wave system with smooth velocity-based scroll dampening.
* **Custom Blending Cursor:** Hardware-accelerated cursor with element-sensing mouseover scaling.
* **Floating Glass Navbar:** Responsive, floating rounded navigation bar with full mobile hamburger drawer menu and logo linking.
* **ScrollTrigger Phone & Card Motion:**
  * Centralized smartphone frame containing simulated WebAR scanner UI.
  * High-resolution pannable 3D food asset (Burger) responsive to mouse tilt physics.
  * Floating frosted glass QR card on right with scanning micro-grid.
  * Floating rating & calorie metrics cards on left.
  * GSAP ScrollTrigger timeline smoothly animating elements out on scroll progression.

---

## 7. Development Roadmap & Next Milestones

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             DEVELOPMENT ROADMAP                         │
├───────────────────┬───────────────────┬───────────────────┬─────────────┤
│ PHASE 1 (Current) │ PHASE 2           │ PHASE 3           │ PHASE 4     │
│ Landing Page      │ Dashboard & Auth  │ AI 3D Pipeline    │ WebAR Engine│
├───────────────────┼───────────────────┼───────────────────┼─────────────┤
│ • Hero (Done)     │ • Supabase Auth   │ • 3D AI Studio    │ • GLB/USDZ  │
│ • How It Works    │ • Menu CRUD       │   API Integration │   Viewer    │
│ • 3D Builder Demo │ • Analytics View  │ • Automated Mesh  │ • Quick Look│
│ • Pricing Calculator• QR Exporter     │   Optimization    │   Fallback  │
└───────────────────┴───────────────────┴───────────────────┴─────────────┘
```

### Next Immediate Tasks (Landing Page Completion)
1. **Interactive "How It Works" Section (`Workflow`):**
   * Step 1: Upload 2D Food Photo.
   * Step 2: AI generates 3D WebAR model.
   * Step 3: Print QR Code for table.
   * Step 4: Diners scan & view.
2. **Interactive 3D Builder Preview Section:**
   * Live interactive preview box showing how restaurant owners customize colors, lighting, and USDZ exports.
3. **Pricing Tier Section:**
   * Interactive calculator comparing physical menu print costs vs. Dish360 AR menu ROI.
4. **Restaurant Directory Preview & FAQ:**
   * Filterable dish cards and accordions addressing common restaurant owner objections (wifi requirements, lighting, mobile support).

---

## 8. AI Agent Operating Rules & Coding Standards

When continuing development on Dish360, all AI agents **must** adhere to the following directives:

1. **Non-Destructive Refactoring:** Always preserve existing working animations (GSAP, Framer Motion, Canvas) when adding new sections or components.
2. **Strict Component Isolation:** Build reusable components in `preview-app/components/` and import them cleanly into `page.tsx`.
3. **Asset Verification:** Ensure images and 3D models exist in `preview-app/public/` prior to referencing them in code.
4. **Performance First:**
   * Always optimize 3D assets (`.glb` under 5MB).
   * Include responsive fallbacks for low-bandwidth networks (`effectiveType === '3g'`).
   * Clean up event listeners, GSAP contexts (`ctx.revert()`), and requestAnimationFrame IDs inside `useEffect` cleanup return functions.
5. **No Placeholders:** Generate or use high-quality functional visual assets rather than blank placeholder gray boxes.
6. **Command Verification:** Always verify code compiles cleanly (`npm run build` or Next.js dev server status) after making modifications.

---

*This master context file was created to serve as an all-in-one onboarding brief for any autonomous coding agent working on Dish360.*
