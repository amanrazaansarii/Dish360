import React from "react";
import type { Metadata } from "next";
import StoryHeader from "@/components/story/StoryHeader";
import Scene1AmbientTable from "@/components/story/Scene1AmbientTable";
import Scene2ScanAwakening from "@/components/story/Scene2ScanAwakening";
import Scene3WebARImmersion from "@/components/story/Scene3WebARImmersion";
import Scene4ChefStudio from "@/components/story/Scene4ChefStudio";
import Scene5CommandRoi from "@/components/story/Scene5CommandRoi";

export const metadata: Metadata = {
  title: "Dish360 Story — The 5-Beat Cinematic WebAR Dining Journey",
  description:
    "Experience the cinematic transition from candlelit paper menus to zero-app WebAR 3D dishes, real-time Chef iPad studio modulation, and proven +25% restaurant AOV uplift.",
};

export default function StoryPage() {
  return (
    <main className="relative min-h-screen bg-background text-ink overflow-x-hidden selection:bg-sage/20 selection:text-white">
      {/* Floating 5-Chapter Navigation Header with Web Audio Ambience */}
      <StoryHeader />

      {/* Beat 1: The Ambient Table & Leather Menu */}
      <Scene1AmbientTable />

      {/* Beat 2: The Optical Scan Awakening & 2D-to-3D Levitation */}
      <Scene2ScanAwakening />

      {/* Beat 3: Diner WebAR 360° Immersion & Holographic HUD */}
      <Scene3WebARImmersion />

      {/* Beat 4: The Chef's iPad Admin Studio & Kitchen Pass Modulation */}
      <Scene4ChefStudio />

      {/* Beat 5: Restaurant Command Hub, ROI Horizon & Printable Standee Studio */}
      <Scene5CommandRoi />
    </main>
  );
}
