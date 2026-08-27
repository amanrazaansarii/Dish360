"use client";

import React, { useState } from "react";
import {
  Upload,
  Cpu,
  QrCode,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "upload",
      stepNumber: "01",
      title: "Snap & Upload 2D Photo",
      subtitle: "Zero 3D scanning equipment needed",
      description:
        "Take a single photo of any dish from your kitchen using a standard smartphone. Upload it to the Dish360 dashboard in seconds.",
      icon: Upload,
      accent: "from-blue-500/20 to-indigo-500/10",
      badge: "ANY SMARTPHONE PHOTO",
      metrics: "Format: JPG, PNG, HEIC",
      previewComponent: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center mb-4 group hover:border-sage transition-colors">
            <Upload className="w-8 h-8 text-sage animate-bounce" />
          </div>
          <div className="text-sm font-semibold text-ink mb-1">
            Drag & Drop Dish Photo
          </div>
          <div className="text-xs text-ink-muted">
            Uploaded: <span className="text-sage">truffle-burger-photo.jpg</span> (4.2 MB)
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-sage/15 text-[11px] font-mono text-sage">
            ✓ Exif & Lighting Balanced
          </div>
        </div>
      ),
    },
    {
      id: "ai",
      stepNumber: "02",
      title: "AI Generates 3D Mesh",
      subtitle: "Sub-minute automated conversion",
      description:
        "Our neural 3D engine converts the 2D photo into a photorealistic, lightweight 3D mesh with true-to-scale geometry, subsurface food scattering, and realistic glazes.",
      icon: Cpu,
      accent: "from-sage/30 to-emerald-500/10",
      badge: "NEURAL 3D RECONSTRUCTION",
      metrics: "Generated in 42s · 2.8 MB",
      previewComponent: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-sage/40 animate-spin" />
            <Sparkles className="w-10 h-10 text-sage" />
          </div>
          <div className="text-sm font-semibold text-ink mb-1">
            Reconstructing Volumetric Food Mesh
          </div>
          <div className="text-xs font-mono text-sage flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
            <span>USDZ & GLB Optimization (60 FPS)</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-ink-muted font-mono">
            <span>Vertices: 18,400</span>
            <span>·</span>
            <span>PBR Texture: 2K</span>
          </div>
        </div>
      ),
    },
    {
      id: "standee",
      stepNumber: "03",
      title: "Print Branded QR Standees",
      subtitle: "Instant vector standee generation",
      description:
        "Dish360 automatically embeds your restaurant's logo, colors, and typography onto elegant acrylic table standee templates and digital cards.",
      icon: QrCode,
      accent: "from-amber-500/20 to-orange-500/10",
      badge: "PRINT READY PDF & SVG",
      metrics: "Custom Table #1 to #50",
      previewComponent: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
          <div className="w-40 p-3.5 rounded-2xl bg-surface-elevated border border-white/15 shadow-2xl text-center">
            <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
              <QrCode className="w-3.5 h-3.5 text-sage" />
            </div>
            <div className="text-[11px] font-bold text-ink mb-2">TABLE 08 · DISH360</div>
            <div className="w-24 h-24 mx-auto p-1.5 rounded-lg bg-white mb-2 flex items-center justify-center">
              <img
                src="/brand/dish360 logo.png"
                alt="Table Standee QR"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="text-[9px] font-mono text-sage uppercase">
              SCAN TO VIEW 3D MENU
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ar",
      stepNumber: "04",
      title: "Diners View in WebAR",
      subtitle: "Zero app download or registration",
      description:
        "Customers point their iPhone or Android camera at the table standee. The dish appears true-to-scale on their dining table in under 1 second.",
      icon: Smartphone,
      accent: "from-emerald-500/20 to-teal-500/10",
      badge: "ZERO-APP FRICTIONLESS WEBAR",
      metrics: "iPhone Safari + Android Chrome",
      previewComponent: (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sage/20 flex items-center justify-center mb-4 text-sage">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="text-sm font-semibold text-ink mb-1">
            Instant True-to-Scale Table View
          </div>
          <div className="text-xs text-ink-soft max-w-xs mb-3">
            Diners inspect dish portions, ingredients, and allergen alerts in real physical dimensions.
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <Zap className="w-3 h-3" />
            <span>+25% Average Order Value Uplift</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="workflow" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
          <Sparkles className="w-3.5 h-3.5 text-sage" />
          <span>Frictionless 4-Step Pipeline</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight mb-4">
          From kitchen photo to{" "}
          <span className="text-sage text-halftone-accent">WebAR table</span> in seconds.
        </h2>
        <p className="text-ink-soft text-sm sm:text-base font-light max-w-xl mx-auto">
          No 3D artists, no costly lidar scanners, no guest apps. Dish360 automates the entire
          pipeline for busy restaurants.
        </p>
      </div>

      {/* Interactive Step Grid & Previewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Interactive Step Cards (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? "bg-surface-elevated/90 border-sage/40 shadow-glass-elevated scale-[1.01]"
                    : "bg-surface/50 border-white/5 hover:border-white/15 hover:bg-surface/70"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-sage text-charcoal font-bold shadow-sage-glow"
                        : "bg-white/5 text-ink-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Step Copy */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-sage uppercase tracking-wider">
                        STEP {step.stepNumber} · {step.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE PREVIEW
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-ink mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-soft font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Simulated Preview Box (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 min-h-[380px] rounded-3xl p-6 bg-surface-elevated/90 backdrop-blur-2xl border border-white/10 shadow-glass-elevated flex flex-col justify-between relative overflow-hidden">
            {/* Top Preview Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                <span className="text-[11px] font-mono text-ink-muted ml-2">
                  DISH360_PIPELINE // STAGE {steps[activeStep].stepNumber}
                </span>
              </div>
              <div className="text-[10px] font-mono text-sage">
                {steps[activeStep].metrics}
              </div>
            </div>

            {/* Dynamic Stage Component Display */}
            <div className="flex-1 my-4 flex items-center justify-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {steps[activeStep].previewComponent}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Progress Selector Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between z-10">
              <button
                onClick={() =>
                  setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))
                }
                className="px-3 py-1 rounded-full text-xs text-ink-muted hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeStep === idx ? "w-6 bg-sage" : "w-1.5 bg-white/20"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))
                }
                className="px-3 py-1 rounded-full text-xs font-semibold text-charcoal bg-sage hover:bg-sage-solid transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
