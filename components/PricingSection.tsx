"use client";

import React, { useState } from "react";
import { Check, ArrowRight, Zap } from "lucide-react";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: "Starter",
      badge: "FREE TRIAL",
      priceMonthly: "$0",
      priceAnnual: "$0",
      description: "Perfect for single cafes and small bistros wanting to test 3D WebAR dining.",
      features: [
        "Up to 5 Active 3D Dishes",
        "Instant WebAR QR Generator",
        "Dish360 Watermark",
        "iOS & Android Compatibility",
        "Standard Analytics (Total Scans)",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Restaurant Pro",
      badge: "MOST POPULAR",
      priceMonthly: "$79",
      priceAnnual: "$64",
      description: "Designed for full-service restaurants looking to replace printed paper menus and maximize order size.",
      features: [
        "Unlimited 3D WebAR Dishes",
        "Automated 2D-to-3D AI Studio",
        "Custom Branded Table Standees",
        "Zero Watermarks / Custom Brand Colors",
        "Real-Time Telemetry & Heatmaps",
        "Calorie, Allergen & Macro HUD Pins",
        "Priority 24/7 Hospitality Support",
      ],
      cta: "Start 14-Day Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise Group",
      badge: "MULTI-LOCATION",
      priceMonthly: "$249",
      priceAnnual: "$199",
      description: "For hotel chains, restaurant franchises, and multi-venue hospitality groups.",
      features: [
        "Unlimited Venues & Menu Profiles",
        "White-Label WebAR Custom Domain",
        "Direct POS Integration (Toast, Square)",
        "Automated Menu Sync & Dayparting",
        "Dedicated 3D Artist Quality Review",
        "Custom SLA & Concierge Onboarding",
      ],
      cta: "Contact Enterprise Sales",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-white/10 mb-4">
          <Zap className="w-3.5 h-3.5 text-sage" />
          <span className="eyebrow-label text-ink-soft">Simple, Transparent Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-[-0.03em] leading-tight mb-4">
          Invest in your tables.{" "}
          <span className="font-serif-luxury font-normal text-white">
            Recoup
          </span>{" "}
          <span className="highlight-pill-sage">
            <span className="text-sage-luminous">
              on day one.
            </span>
          </span>
        </h2>
        <p className="text-ink-soft text-sm sm:text-base font-light max-w-xl mx-auto mb-8 leading-relaxed">
          One 25% larger table bill pays for your entire monthly subscription.
        </p>

        {/* Monthly / Annual Billing Switcher */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-surface-elevated border border-white/10 shadow-glass">
          <button
            onClick={() => setIsAnnual(false)}
            className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              !isAnnual
                ? "bg-sage text-charcoal shadow-sm"
                : "text-ink-soft hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isAnnual
                ? "bg-sage text-charcoal shadow-sm"
                : "text-ink-soft hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full bg-charcoal text-sage text-[10px] font-bold font-mono">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              tier.highlighted
                ? "bg-surface-elevated/95 border-2 border-sage/50 shadow-glass-elevated scale-105 z-10"
                : "bg-surface/70 border border-white/10 shadow-glass hover:border-white/20"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-sage text-charcoal text-[11px] font-black uppercase tracking-wider shadow-sage-glow font-mono">
                RECOMMENDED BY CHEFS
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-ink tracking-tight">{tier.name}</h3>
                <span className="text-[10px] font-mono text-sage bg-sage/15 px-2.5 py-1 rounded-full">
                  {tier.badge}
                </span>
              </div>
              <p className="text-xs text-ink-soft font-light mb-6 min-h-[36px] leading-relaxed">
                {tier.description}
              </p>

              {/* Price Tag */}
              <div className="flex items-baseline gap-1 mb-8 pb-6 border-t border-b border-white/10 pt-4">
                <span className="text-4xl sm:text-5xl font-black text-ink font-mono tabular-nums tracking-tight">
                  {isAnnual ? tier.priceAnnual : tier.priceMonthly}
                </span>
                <span className="text-xs text-ink-muted font-mono">
                  {tier.priceMonthly !== "$0" ? "/ month" : ""}
                </span>
              </div>

              {/* Features List */}
              <ul className="flex flex-col gap-3 mb-8">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-xs text-ink-soft font-light">
                    <div className="w-4 h-4 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-sage" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <a
              href="#studio"
              className={`w-full py-3.5 rounded-full font-semibold text-xs text-center flex items-center justify-center gap-2 transition-all tracking-wide ${
                tier.highlighted
                  ? "bg-sage-solid hover:bg-sage text-charcoal shadow-sage-glow hover:scale-105 active:scale-95"
                  : "bg-white/5 hover:bg-white/10 text-ink border border-white/10 hover:border-white/20"
              }`}
            >
              <span>{tier.cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
