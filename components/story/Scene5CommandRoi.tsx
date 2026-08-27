"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  TrendingUp,
  LineChart,
  Printer,
  Download,
  Sparkles,
  QrCode,
  CheckCircle2,
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Scene5CommandRoi() {
  const [restaurantName, setRestaurantName] = useState("Aurelia Bistro");
  const [tableNumber, setTableNumber] = useState("04");
  const [standeeTheme, setStandeeTheme] = useState<"acrylic" | "brass" | "obsidian">("acrylic");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Interactive ROI Calculator State
  const [dailyCovers, setDailyCovers] = useState<number>(150);
  const [avgTicket, setAvgTicket] = useState<number>(65);

  const monthlyCovers = dailyCovers * 30;
  const currentMonthlyRevenue = monthlyCovers * avgTicket;
  const aovLiftRate = 0.254; // +25.4%
  const monthlyExtraRevenue = Math.round(currentMonthlyRevenue * aovLiftRate);
  const annualExtraRevenue = monthlyExtraRevenue * 12;
  const monthlyWasteSaved = Math.round(monthlyCovers * 0.85);

  const handleDownloadStandee = () => {
    setDownloadSuccess(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#AAD0AF", "#8FB495", "#E5E2E1", "#F5F5ED", "#F59E0B"],
    });
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section
      id="roi-impact"
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Lighting Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[650px] bg-gradient-to-tr from-sage/20 via-slate-800/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Act 05 Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft font-mono">
          ACT 05 // RESTAURANT COMMAND HUB & ROI HORIZON
        </span>
      </motion.div>

      {/* Editorial Headline */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        className="text-center max-w-4xl mx-auto mb-6"
      >
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.05] text-ink font-heading">
          The numbers speak.
          <br />
          The future is <span className="text-sage font-editorial-italic">+25% AOV</span>.
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base sm:text-lg text-ink-soft max-w-2xl text-center mb-16 font-light leading-relaxed font-body"
      >
        Augmented reality removes the cognitive friction of dining. Diners order with their eyes, leading to larger ticket sizes, faster table turns, and zero food waste.
      </motion.p>

      {/* ========================================================================= */}
      {/* 3 CORE TELEMETRY METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Metric 1: AOV Lift */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-[rgba(26,29,33,0.7)] backdrop-blur-xl border border-white/10 shadow-glass flex flex-col justify-between group hover:border-sage/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                AVERAGE ORDER VALUE
              </span>
              <div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-sage font-mono mb-2">
              +25.4%
            </div>
            <p className="text-xs text-ink-muted leading-relaxed font-body">
              Diners add appetizers, premium wine pairings, and desserts after inspecting 3D holographic previews.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-sage">
            <span>MEASURED ON 12,000+ COVERS</span>
            <span>↑ +$18.40/TICKET</span>
          </div>
        </motion.div>

        {/* Metric 2: AR View-to-Order Conversion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl bg-[rgba(26,29,33,0.7)] backdrop-blur-xl border border-white/10 shadow-glass flex flex-col justify-between group hover:border-sage/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                CONVERSION MULTIPLIER
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-ink font-mono mb-2">
              3.8x
            </div>
            <p className="text-xs text-ink-muted leading-relaxed font-body">
              Diners who preview dishes in WebAR convert 3.8x higher on high-margin specialty items compared to static PDF menus.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-emerald-400">
            <span>ZERO APP FRICTION</span>
            <span>Safari & Chrome</span>
          </div>
        </motion.div>

        {/* Metric 3: Return & Waste Reduction */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-3xl bg-[rgba(26,29,33,0.7)] backdrop-blur-xl border border-white/10 shadow-glass flex flex-col justify-between group hover:border-sage/40 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">
                PORTION ACCURACY
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono mb-2">
              -42%
            </div>
            <p className="text-xs text-ink-muted leading-relaxed font-body">
              Drastic reduction in food returns, size complaints, and allergen conflicts through 1:1 true-to-scale visual expectations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-amber-300">
            <span>ZERO COMPLAINTS</span>
            <span>1:1 SCALE VERIFIED</span>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE RESTAURANT ROI REVENUE CALCULATOR LEDGER */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-5xl rounded-3xl p-6 sm:p-10 bg-[rgba(26,29,33,0.8)] backdrop-blur-2xl border border-white/10 shadow-glass-elevated mb-12"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink tracking-tight">
                Live Restaurant ROI & Revenue Simulator
              </div>
              <div className="text-[11px] text-ink-muted font-mono">
                Calculate your location's projected annual profit uplift with Dish360 WebAR
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-sage/20 border border-sage/40 text-sage text-xs font-mono font-bold">
            PROVEN +25.4% GAIN
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (Left) */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Daily Covers */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink">Daily Guest Covers</span>
                <span className="text-base font-black text-sage font-mono">{dailyCovers} guests/day</span>
              </div>
              <input
                type="range"
                min="40"
                max="500"
                step="10"
                value={dailyCovers}
                onChange={(e) => setDailyCovers(Number(e.target.value))}
                className="w-full h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-sage"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-2">
                <span>Boutique: 40</span>
                <span>Mid-Size: 150</span>
                <span>Flagship: 500+</span>
              </div>
            </div>

            {/* 2. Average Check Size */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink">Average Check / Ticket</span>
                <span className="text-base font-black text-amber-300 font-mono">${avgTicket}.00</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={avgTicket}
                onChange={(e) => setAvgTicket(Number(e.target.value))}
                className="w-full h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-2">
                <span>Casual: $20</span>
                <span>Polished Casual: $65</span>
                <span>Fine Dining: $150+</span>
              </div>
            </div>
          </div>

          {/* Computed Ledger (Right) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-black/60 to-black/80 border border-sage/30 relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-widest text-ink-muted mb-4">
              PROJECTED FINANCIAL REVENUE LIFT
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-ink-soft">Current Monthly Gross:</span>
                <span className="text-sm font-mono text-ink font-bold tabular-nums">
                  ${currentMonthlyRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-sage font-medium">Monthly Extra Revenue (+25.4%):</span>
                <span className="text-xl font-mono text-sage font-black tabular-nums">
                  +${monthlyExtraRevenue.toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs text-amber-300 font-medium">Food Waste & Reprint Savings:</span>
                <span className="text-sm font-mono text-amber-300 font-bold tabular-nums">
                  +${monthlyWasteSaved.toLocaleString()}/mo
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Annual Net Impact:</span>
                <span className="text-2xl sm:text-3xl font-mono text-sage font-black drop-shadow-[0_0_15px_rgba(170,208,175,0.4)] tabular-nums">
                  +${annualExtraRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* INSTANT PRINTABLE TABLE STANDEE GENERATOR STUDIO */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl rounded-3xl p-6 sm:p-10 bg-[rgba(26,29,33,0.75)] backdrop-blur-2xl border border-white/10 shadow-glass-elevated mb-16">
        {/* Studio Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink tracking-tight">
                Instant Table Standee PDF Exporter
              </div>
              <div className="text-[11px] text-ink-muted font-mono">
                Generate branded vector print files for any print shop
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadStandee}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal text-xs font-bold shadow-sage-glow hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector Print Template</span>
          </button>
        </div>

        {/* Dual Column: Standee Config (Left) + Live Print Visualizer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Standee Controls */}
          <div className="lg:col-span-6 space-y-5">
            {/* Restaurant Name Input */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Restaurant / Brand Name
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-ink focus:outline-none focus:border-sage transition-colors font-medium"
                placeholder="e.g. Aurelia Bistro"
              />
            </div>

            {/* Table Number Selector */}
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Table Identification Number
              </label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-ink focus:outline-none focus:border-sage transition-colors font-mono"
                placeholder="e.g. 04 or VIP-01"
              />
            </div>

            {/* Standee Material Theme */}
            <div>
              <label className="block text-xs font-bold text-ink mb-2">
                Physical Standee Finish & Material
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStandeeTheme("acrylic")}
                  className={`p-3 rounded-xl text-xs font-medium border transition-all text-left ${
                    standeeTheme === "acrylic"
                      ? "bg-sage/20 border-sage/50 text-sage shadow-[0_0_12px_rgba(170,208,175,0.3)]"
                      : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="font-bold">Clear Acrylic</div>
                  <div className="text-[10px] opacity-75">Translucent Frost</div>
                </button>

                <button
                  onClick={() => setStandeeTheme("brass")}
                  className={`p-3 rounded-xl text-xs font-medium border transition-all text-left ${
                    standeeTheme === "brass"
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="font-bold">Brushed Brass</div>
                  <div className="text-[10px] opacity-75">Fine Dining Luxe</div>
                </button>

                <button
                  onClick={() => setStandeeTheme("obsidian")}
                  className={`p-3 rounded-xl text-xs font-medium border transition-all text-left ${
                    standeeTheme === "obsidian"
                      ? "bg-slate-700/40 border-slate-500/50 text-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                  }`}
                >
                  <div className="font-bold">Obsidian Slate</div>
                  <div className="text-[10px] opacity-75">Matte Midnight</div>
                </button>
              </div>
            </div>

            {/* Print Specification Metadata */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-ink-muted space-y-1">
              <div className="flex justify-between">
                <span>Dimensions:</span>
                <span className="text-ink">105mm × 148mm (A6 Standard)</span>
              </div>
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span className="text-sage">300 DPI CMYK Vector PDF</span>
              </div>
              <div className="flex justify-between">
                <span>Bleed / Crop Marks:</span>
                <span className="text-ink">3mm Safety Included</span>
              </div>
            </div>
          </div>

          {/* Right: Live Standee Visualizer Mirror */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* Visualizer Frame */}
            <div
              className={`relative w-full max-w-[280px] p-6 rounded-[28px] border transition-all duration-500 shadow-2xl ${
                standeeTheme === "acrylic"
                  ? "bg-[rgba(30,34,38,0.7)] backdrop-blur-2xl border-sage/40 shadow-[0_20px_60px_rgba(170,208,175,0.25)]"
                  : standeeTheme === "brass"
                  ? "bg-gradient-to-b from-[#2a241a] via-[#1a1711] to-[#12100c] border-amber-500/40 shadow-[0_20px_60px_rgba(245,158,11,0.25)]"
                  : "bg-gradient-to-b from-[#1c1f24] to-[#0c0d0e] border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              }`}
            >
              {/* Standee Top Crop Marks */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sage/20 flex items-center justify-center text-sage">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-ink">{restaurantName}</span>
                </div>
                <span className="text-[10px] font-mono text-sage font-bold">
                  TABLE {tableNumber}
                </span>
              </div>

              {/* QR Render Matrix */}
              <div className="relative aspect-square w-full rounded-2xl bg-black/50 border border-white/10 p-4 my-4 flex flex-col items-center justify-center">
                {/* 5x5 Synthetic QR Cells */}
                <div className="grid grid-cols-5 gap-1.5 w-36 h-36">
                  {[
                    1, 1, 1, 0, 1,
                    1, 0, 1, 1, 0,
                    1, 1, 1, 0, 1,
                    0, 1, 0, 1, 1,
                    1, 0, 1, 1, 1,
                  ].map((cell, idx) => (
                    <div
                      key={idx}
                      className={`rounded-[2px] ${
                        cell === 1
                          ? standeeTheme === "brass"
                            ? "bg-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                            : "bg-sage shadow-[0_0_6px_rgba(170,208,175,0.5)]"
                          : "bg-white/5"
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-charcoal/90 border border-sage/60 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-sage" />
                  </div>
                </div>
              </div>

              {/* Standee Footer Note */}
              <div className="text-center pt-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-ink">Scan for 3D WebAR Dining</div>
                <div className="text-[9px] text-ink-muted font-mono">No App Download · Safari & Chrome</div>
              </div>

              {/* Laser-Cut Base Simulation */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-2.5 rounded-full bg-white/20 blur-[0.5px]" />
            </div>

            <AnimatePresence>
              {downloadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Vector PDF Standee for {restaurantName} (Table {tableNumber}) generated!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH IMPACT CONVERSION FINALE BANNER */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-surface via-surface-elevated to-black/80 border border-white/15 shadow-glass-elevated text-center relative overflow-hidden">
        {/* Glowing Background Radial */}
        <div className="absolute inset-0 bg-sage/5 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage/20 border border-sage/40 text-sage text-xs font-mono font-semibold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to Deploy Dish360?</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-normal text-ink tracking-tight leading-tight mb-4 font-heading">
            Transform your dining room into an{" "}
            <span className="text-sage font-editorial-italic">augmented reality stage</span>.
          </h3>

          <p className="text-sm sm:text-base text-ink-soft max-w-xl mx-auto mb-8 font-light leading-relaxed font-body">
            Zero hardware cost. Zero app barrier. Join the Michelin-starred and forward-thinking restaurants elevating the guest dining journey.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal font-bold text-sm shadow-sage-glow hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore Complete SaaS Platform</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-ink text-sm font-medium border border-white/10 shadow-glass transition-all hover:scale-105"
            >
              <ArrowUp className="w-4 h-4 text-sage" />
              <span>Replay Cinematic Story</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
