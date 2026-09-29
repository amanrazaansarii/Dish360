"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronDown,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Do our restaurant guests need to download an app?",
    a: "Zero app downloads required. Diners simply scan the table QR code using their iPhone or Android default camera. The true-to-scale 3D dish launches instantaneously via native iOS Safari Quick Look or Android Chrome WebXR.",
  },
  {
    q: "How do we create 3D models of our dishes?",
    a: "You do not need 3D artists or expensive lidar rigs. Simply take a standard photo of your plated dish using any smartphone and upload it to the Dish360 dashboard. Our neural AI engine reconstructs the volumetric 3D mesh automatically in under a minute.",
  },
  {
    q: "Will this slow down our guests on cellular networks?",
    a: "No. Dish360 automatically compresses and optimizes all 3D `.glb` and `.usdz` assets to under 3MB using Draco geometry compression and progressive PBR texture streaming, loading seamlessly over standard 4G/5G mobile connections.",
  },
  {
    q: "Can we update prices and 86 sold-out items in real time?",
    a: "Yes! Your table QR standees remain fixed. When you update a dish price, description, or mark an item as sold out in your Dish360 management dashboard, the WebAR view updates instantly for all active diners.",
  },
  {
    q: "What physical standees or table hardware do we need?",
    a: "Zero proprietary hardware. Dish360 provides one-click vector PDF and PNG standee templates tailored to standard 4x6 or 5x7 acrylic table tents. You can print them at any local print shop or order pre-made stands through our concierge.",
  },
];

export default function FaqFooter() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <footer className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* FAQ Accordion Section */}
      <div className="max-w-3xl mx-auto mb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-white/10 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-sage" />
            <span className="eyebrow-label text-ink-soft">Frequently Answered Inquiries</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-[-0.03em] leading-tight">
            Everything you need to know about{" "}
            <span className="font-serif-luxury font-normal text-white">
              living
            </span>{" "}
            <span className="highlight-pill-sage">
              <span className="text-sage-luminous">
                WebAR Dining
              </span>
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-surface/70 backdrop-blur-xl border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-ink tracking-tight">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-sage/20 text-sage" : "text-ink-muted"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 text-xs sm:text-sm text-ink-soft font-light leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Big Final Conversion Banner */}
      <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-surface-elevated to-black/80 border border-white/15 shadow-glass-elevated text-center overflow-hidden mb-20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] font-mono text-sage mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JOIN 200+ FORWARD-THINKING RESTAURANTS</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-black text-ink tracking-[-0.03em] mb-4 leading-tight">
            Ready to upgrade your menus to{" "}
            <span className="font-serif-luxury font-normal text-white">
              living
            </span>{" "}
            <span className="highlight-pill-sage">
              <span className="text-sage-luminous">
                WebAR
              </span>
            </span>
            ?
          </h3>

          <p className="text-ink-soft text-sm sm:text-base font-light mb-8 max-w-lg mx-auto leading-relaxed">
            Set up your first 3D dish in under 5 minutes. No credit card required.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#studio"
              className="px-8 py-4 rounded-full bg-sage-solid hover:bg-sage text-charcoal font-bold text-xs tracking-wide shadow-sage-glow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Launch 3D Menu Builder</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#pricing"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-ink font-semibold text-xs tracking-wide border border-white/10 transition-colors"
            >
              View Pricing Plans
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-ink-muted font-sans">
        {/* Brand info */}
        <div className="flex items-center gap-3">
          <Image
            src="/brand/dish360 logo.png"
            alt="Dish360 Brand Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <div className="flex flex-col text-left">
            <span className="font-bold text-ink text-sm tracking-tight">Dish360</span>
            <span className="text-[10px] text-ink-muted">© 2026 Dish360 Technologies Inc. All rights reserved.</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a href="#ar-inspector" className="hover:text-white transition-colors">
            WebAR Engine
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Pipeline
          </a>
          <a href="#studio" className="hover:text-white transition-colors">
            3D Studio
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <span className="flex items-center gap-1.5 text-sage font-mono text-[10px] tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-sage animate-ping" />
            <span>SYSTEMS NOMINAL</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
