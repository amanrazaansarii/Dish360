import type { Metadata, Viewport } from "next";
import "./globals.css";
import FluidCanvasBackground from "@/components/FluidCanvasBackground";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Dish360 — Interactive WebAR Dining Menus for Modern Restaurants",
  description:
    "Transform flat PDF and paper menus into frictionless, zero-app WebAR 3D dining experiences that stimulate diner appetites and increase order value by 25%.",
  icons: {
    icon: "/brand/dish360 logo.png",
  },
  keywords: [
    "WebAR restaurant menu",
    "3D food menu",
    "Augmented Reality Dining",
    "Dish360 SaaS",
    "Interactive QR menu",
    "Digital Sommelier",
  ],
};

export const viewport: Viewport = {
  themeColor: "#131313",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-ink antialiased selection:bg-sage/20 selection:text-white relative min-h-screen">
        {/* Global SVG Filters for Headline Gaussian Depth of Field & Halftones */}
        <svg
          className="pointer-events-none absolute w-0 h-0 overflow-hidden"
          aria-hidden="true"
        >
          <defs>
            <filter id="h-blur">
              <feGaussianBlur stdDeviation="3 0" />
            </filter>
            <filter id="h-blur-sm">
              <feGaussianBlur stdDeviation="1.5 0" />
            </filter>
            <filter id="film-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>
        </svg>

        {/* Viewport Living Background Canvas */}
        <FluidCanvasBackground />

        {/* Cinematic Film Grain Overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-40 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Hardware-Accelerated Difference Cursor (Desktop) */}
        <CustomCursor />

        {/* Main Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
