import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorkflowSection from "@/components/WorkflowSection";
import MenuBuilderStudio from "@/components/MenuBuilderStudio";
import AnalyticsRoiHub from "@/components/AnalyticsRoiHub";
import InteractiveMenuDirectory from "@/components/InteractiveMenuDirectory";
import PricingSection from "@/components/PricingSection";
import FaqFooter from "@/components/FaqFooter";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background text-ink overflow-x-hidden">
      {/* Fixed Floating Navigation Bar */}
      <Navbar />

      {/* Act 1: Hero & Signature Move A (Live Operable 3D Food & AR Table Inspector) */}
      <Hero />

      {/* Act 2: 4-Step 2D-to-3D AI Pipeline Workflow */}
      <WorkflowSection />

      {/* Act 3: The Engineered Peak (Interactive 3D Menu Builder Studio) */}
      <MenuBuilderStudio />

      {/* Act 4: Telemetry & Interactive ROI Proof Ledger */}
      <AnalyticsRoiHub />

      {/* Act 5: Public WebAR Discovery & Menu Filter Directory */}
      <InteractiveMenuDirectory />

      {/* Act 6: Transparent Tiered Pricing */}
      <PricingSection />

      {/* Act 7: FAQ Accordion & Conversion Footer */}
      <FaqFooter />
    </main>
  );
}
