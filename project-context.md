# Project Overview: AR Menu SaaS Platform

## The Business Model
We are building a B2B2C Software-as-a-Service (SaaS) platform for premium restaurants. The goal is to replace flat PDF menus with an immersive, frictionless WebAR (Augmented Reality) experience. 
* **Restaurants** pay a monthly subscription to host their 3D menus (or use a free tier supported by ads).
* **Customers** view the 3D food at real size on their tables without downloading any apps.

## The Tech Stack
* **Frontend:** Next.js, React, Tailwind CSS (Dark theme, glassmorphism aesthetics).
* **Animations:** Framer Motion (heavy use of scroll animations, parallax, and 3D floating effects).
* **Backend/Auth/Database:** Supabase.
* **3D Generation:** 3D AI Studio API (automated 2D image to 3D .glb conversion).
* **AR Viewer:** Google Model Viewer.
* **Utilities:** qrcode.js (for generating table standee codes).

## Core Architecture
1. **Sales Engine (Landing Page):** Immersive, high-end UI proving ROI to restaurant owners.
2. **Management Dashboard:** Secure portal for restaurants to upload 2D food photos, view insights, manage their menu list, and download unique QR codes.
3. **Discovery Layer:** A directory for users to search for restaurants and view full menus.
4. **AR Engine:** The frictionless WebAR view triggered by scanning a QR code or clicking a dish in the directory.

## AI Agent Directives
* Prioritize performance and mobile responsiveness (specifically for the AR viewer on 4G networks).
* Maintain a premium, "extremely worked on" visual identity.
* Do not build the whole app at once; work section by section, starting with the Landing Page Hero Section.