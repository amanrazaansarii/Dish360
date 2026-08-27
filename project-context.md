# Project Overview: Dish360 AR Menu SaaS Platform

> **Master Specification:** For the complete, detailed, production-ready specification and AI context, refer to [`PROJECT_MASTER_CONTEXT.md`](./PROJECT_MASTER_CONTEXT.md).

## The Business Model
We are building a B2B2C Software-as-a-Service (SaaS) platform for premium restaurants. The goal is to replace flat PDF menus with an immersive, frictionless WebAR (Augmented Reality) experience. 
* **Restaurants** pay a monthly subscription to host their 3D menus (or use a free tier supported by ads).
* **Customers** view the 3D food at real size on their tables without downloading any apps.

## The Tech Stack
* **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
* **Animations:** GSAP 3.15 + ScrollTrigger, Framer Motion 12, HTML5 2D Canvas.
* **Backend/Auth/Database:** Supabase (PostgreSQL, RLS, Storage Buckets).
* **3D Generation:** 3D AI Studio API (automated 2D image to 3D .glb conversion).
* **AR Viewer:** Google Model Viewer (`@google/model-viewer` v4.2) + iOS AR Quick Look (`.usdz`).
* **Utilities:** qrcode.js (for generating table standee codes).

## Core Architecture
1. **Sales Engine (Landing Page):** Immersive, high-end UI proving ROI to restaurant owners.
2. **Management Dashboard (`/dashboard`):** Secure portal for restaurants to upload 2D food photos, view insights, manage their menu list, and download unique QR codes.
3. **Discovery Layer (`/directory`):** A public directory for users to search for restaurants and view full menus.
4. **AR Engine (`/ar/[dish_id]`):** The frictionless WebAR view triggered by scanning a QR code or clicking a dish in the directory.

## AI Agent Directives
* Always inspect [`PROJECT_MASTER_CONTEXT.md`](./PROJECT_MASTER_CONTEXT.md) for complete visual, technical, and architectural rules.
* Prioritize performance and mobile responsiveness (specifically for the AR viewer on 4G networks).
* Maintain a premium, "extremely worked on" visual identity (Dark luxury claymorphic theme).
* Work section by section, maintaining non-destructive animation code.