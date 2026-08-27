"use client";

import React, { useState } from "react";
import { Sparkles, QrCode, ArrowDown, Flame, UtensilsCrossed } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Scene1AmbientTable() {
  const [standeeHovered, setStandeeHovered] = useState(false);
  const [kelvinTemp, setKelvinTemp] = useState<number>(2200);
  const [selectedTable, setSelectedTable] = useState<string>("TABLE 04 // CHEF'S RESERVE");

  // Mouse tilt physics for the table perspective
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 28, stiffness: 90, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tableRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [6, -6]);
  const tableRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const standeeTranslateX = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const standeeTranslateY = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollToNext = () => {
    const el = document.getElementById("scan-awakening");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="ambient-table"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Warm Ambient Candlelight Spotlight Reactive to Kelvin State */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full blur-[110px] pointer-events-none -z-10 transition-all duration-700"
        style={{
          background:
            kelvinTemp <= 2400
              ? "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(170, 208, 175, 0.08) 50%, transparent 80%)"
              : kelvinTemp <= 3500
              ? "radial-gradient(circle, rgba(254, 240, 138, 0.15) 0%, rgba(170, 208, 175, 0.1) 50%, transparent 80%)"
              : "radial-gradient(circle, rgba(203, 213, 225, 0.15) 0%, rgba(170, 208, 175, 0.12) 50%, transparent 80%)",
        }}
      />

      {/* Act 01 Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft font-mono">
          ACT 01 // THE AMBIENT TABLE
        </span>
      </motion.div>

      {/* Editorial Headline */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="text-center max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight leading-[1.05] text-ink font-heading">
          The 120-year-old <span className="font-editorial-italic text-ink">paper illusion</span>.
          <br />
          Ready to be <span className="text-sage font-editorial-italic">awakened</span>.
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-base sm:text-lg text-ink-soft max-w-2xl text-center mb-12 font-light leading-relaxed font-body"
      >
        Every evening, millions of diners sit at candlelit tables, deciphering flat descriptions and 2D ink.
        Beside the leather menu rests a silent glass totem waiting for light.
      </motion.p>

      {/* ========================================================================= */}
      {/* 3D SCENE STAGE: LUXURY CANDLELIT TABLETOP & EMBOSSED LEATHER MENU */}
      {/* ========================================================================= */}
      <motion.div
        style={{
          rotateX: tableRotateX,
          rotateY: tableRotateY,
          transformPerspective: 1200,
        }}
        className="relative w-full max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-[rgba(26,29,33,0.75)] backdrop-blur-2xl border border-white/10 shadow-glass-elevated"
      >
        {/* Tabletop Surface Texture */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(circle at 75% 25%, rgba(245,158,11,0.15), transparent 45%), radial-gradient(circle at 25% 75%, rgba(170,208,175,0.1), transparent 50%)`,
            }}
          />
        </div>

        {/* Top Atmosphere Meta HUD with Interactive Controls */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            {/* Table Selector */}
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
            >
              <option value="TABLE 04 // CHEF'S RESERVE">TABLE 04 // CHEF'S RESERVE</option>
              <option value="TABLE 12 // CORNER BOOTH">TABLE 12 // CORNER BOOTH</option>
              <option value="VIP TABLE // TERRACE PATIO">VIP TABLE // TERRACE PATIO</option>
            </select>

            {/* Atmosphere Kelvin Switcher */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/5 text-[11px] font-mono">
              <span className="text-ink-muted">Atmosphere:</span>
              <button
                onClick={() => setKelvinTemp(2200)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  kelvinTemp === 2200 ? "bg-amber-500/30 text-amber-300 font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                2200K Candle
              </button>
              <button
                onClick={() => setKelvinTemp(3200)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  kelvinTemp === 3200 ? "bg-amber-300/30 text-amber-200 font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                3200K Warm
              </button>
              <button
                onClick={() => setKelvinTemp(5000)}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  kelvinTemp === 5000 ? "bg-slate-300/30 text-slate-200 font-bold" : "text-ink-muted hover:text-ink"
                }`}
              >
                5000K Day
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-sage">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
            <span>STANDBY_FOR_SCAN</span>
          </div>
        </div>

        {/* Center Grid: Open Menu Book (Left) + Acrylic QR Standee (Right) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Open Leather-Bound Restaurant Menu Book */}
          <div className="lg:col-span-7 relative group">
            {/* Soft shadow under the book */}
            <div className="absolute -inset-2 bg-black/60 rounded-3xl blur-xl -z-10" />

            <div className="relative rounded-2xl p-5 sm:p-7 bg-gradient-to-br from-[#23201d] via-[#1a1715] to-[#121110] border border-amber-900/30 shadow-2xl overflow-hidden">
              {/* Gold Foil Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400/80" />
                  <span className="text-xs tracking-[0.25em] font-serif uppercase text-amber-200/90 font-medium">
                    AURELIA BISTRO & GRILL
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400/60 uppercase tracking-widest">
                  EST. 2026
                </span>
              </div>

              {/* Menu Item: Wagyu Truffle Artisan Burger */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* 2D Flat Printed Photo */}
                <div className="sm:col-span-5 relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/5 p-2 flex items-center justify-center">
                  <div className="relative w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-charcoal-light/30 to-black/60 flex items-center justify-center">
                    <img
                      src="/brand/dish360 logo.png"
                      alt="Flat Printed 2D Dish"
                      className="w-24 h-24 object-contain opacity-75 grayscale-[20%] contrast-110"
                    />
                    {/* Printed Halftone Grain Overlay */}
                    <div
                      className="absolute inset-0 opacity-30 pointer-events-none mix-blend-color-burn"
                      style={{
                        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                        backgroundSize: "4px 4px",
                      }}
                    />
                    <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-[9px] font-mono text-ink-muted border border-white/10">
                      FLAT 2D PHOTO
                    </div>
                  </div>
                </div>

                {/* Flat Typography Description */}
                <div className="sm:col-span-7 flex flex-col justify-between h-full py-1">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight font-serif">
                        A5 Miyazaki Wagyu & Truffle Brioche
                      </h3>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed font-light mb-3">
                      Dry-aged Japanese A5 Wagyu patty, shaved Norcia black winter truffle, melted Gruyère Réserve, caramelized shallot emulsion on toasted milk brioche.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs font-mono text-ink-muted">ITEM #01</span>
                    <span className="text-base font-bold text-amber-200 font-mono">$24.00</span>
                  </div>
                </div>
              </div>

              {/* Physical Paper Note */}
              <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[11px] text-ink-muted font-light">
                <span>Dietary inquiries: Ask your captain</span>
                <span className="italic text-amber-400/80">Can a flat photo capture the aroma?</span>
              </div>
            </div>
          </div>

          {/* Right: The Translucent Glowing Dish360 Acrylic QR Standee */}
          <motion.div
            style={{
              x: standeeTranslateX,
              y: standeeTranslateY,
            }}
            onMouseEnter={() => setStandeeHovered(true)}
            onMouseLeave={() => setStandeeHovered(false)}
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
          >
            {/* Ambient Base Reflection */}
            <div className="absolute -bottom-6 w-48 h-8 bg-sage/20 rounded-full blur-xl pointer-events-none" />

            {/* Glowing Acrylic Standee Prism */}
            <div
              className={`relative w-full max-w-[260px] p-5 rounded-[24px] bg-[rgba(30,34,38,0.65)] backdrop-blur-2xl border transition-all duration-500 ${
                standeeHovered
                  ? "border-sage/60 shadow-[0_20px_60px_rgba(170,208,175,0.35)] scale-[1.03]"
                  : "border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
              }`}
            >
              {/* Standee Bevel Highlight Top */}
              <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Standee Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-ink tracking-tight">Dish360 Standee</div>
                    <div className="text-[10px] text-sage font-mono">TABLE_AR // LIVE</div>
                  </div>
                </div>

                <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
              </div>

              {/* Translucent QR Matrix Grid (Design Spec §7) */}
              <div className="relative aspect-square w-full rounded-2xl bg-black/40 border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden group">
                {/* Corner AR Brackets */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-sage/60" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-sage/60" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-sage/60" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-sage/60" />

                {/* 5x5 Synthetic QR Cell Grid */}
                <div className="grid grid-cols-5 gap-1.5 w-32 h-32 p-1">
                  {[
                    1, 1, 1, 0, 1,
                    1, 0, 1, 1, 0,
                    1, 1, 1, 0, 1,
                    0, 1, 0, 1, 1,
                    1, 0, 1, 1, 1,
                  ].map((cell, idx) => (
                    <div
                      key={idx}
                      className={`rounded-[3px] transition-colors duration-300 ${
                        cell === 1
                          ? "bg-sage/75 shadow-[0_0_8px_rgba(170,208,175,0.4)]"
                          : "bg-white/5"
                      }`}
                    />
                  ))}
                </div>

                {/* Pulsating Center Emblem */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-charcoal/90 border border-sage/50 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-sage animate-pulse" />
                  </div>
                </div>

                {/* Scanline Sweep Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sage to-transparent animate-scanline opacity-75" />
              </div>

              {/* Standee Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-center">
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-ink">Scan with Camera</div>
                  <div className="text-[9px] text-ink-muted font-mono">NO APP DOWNLOAD</div>
                </div>
                <div className="px-2 py-1 rounded-full bg-sage/20 text-sage text-[10px] font-mono font-bold">
                  v4.2 AR
                </div>
              </div>

              {/* Acrylic Stand Base Notch */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-28 h-2 rounded-full bg-gradient-to-r from-white/10 via-white/30 to-white/10 border border-white/20 blur-[0.5px]" />
            </div>

            <p className="text-[11px] font-mono text-ink-muted mt-5 text-center">
              [ Acrylic Standee // Ready for optical lock-on ]
            </p>
          </motion.div>
        </div>

        {/* Bottom Interactive Trigger to Advance */}
        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Sparkles className="w-4 h-4 text-sage" />
            <span>Ready for the diner to bring out their smartphone?</span>
          </div>

          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface hover:bg-white/10 text-ink hover:text-white text-xs font-semibold border border-white/10 shadow-glass transition-all hover:scale-105"
          >
            <span>Initiate Optical Scan</span>
            <ArrowDown className="w-3.5 h-3.5 text-sage animate-bounce" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
