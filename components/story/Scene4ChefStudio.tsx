"use client";

import React, { useState } from "react";
import {
  Sliders,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowRight,
  Tablet,
  ChefHat,
  Eye,
  DollarSign,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Scene4ChefStudio() {
  const [dishPrice, setDishPrice] = useState<number>(24);
  const [is86d, setIs86d] = useState<boolean>(false);
  const [lightingMode, setLightingMode] = useState<"candlelight" | "midday" | "spotlight">("candlelight");
  const [extraTruffle, setExtraTruffle] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncedRecently, setSyncedRecently] = useState<boolean>(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncedRecently(true);
      setTimeout(() => setSyncedRecently(false), 3000);
    }, 1200);
  };

  const scrollToNext = () => {
    const el = document.getElementById("roi-impact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getCalculatedPrice = () => {
    return dishPrice + (extraTruffle ? 5 : 0);
  };

  return (
    <section
      id="chef-studio"
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Studio Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[600px] bg-gradient-to-tr from-sage/15 via-slate-800/15 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Act 04 Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft font-mono">
          ACT 04 // THE CHEF'S IPAD ADMIN STUDIO
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
          Total culinary control.
          <br />
          From the <span className="text-sage font-editorial-italic">kitchen pass</span>.
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base sm:text-lg text-ink-soft max-w-2xl text-center mb-12 font-light leading-relaxed font-body"
      >
        The kitchen runs fast. Adjust prices dynamically for market ingredients, 86 an item across 50 tables in 1 second, or re-tune lighting for the evening dinner service.
      </motion.p>

      {/* ========================================================================= */}
      {/* CHEF'S IPAD PRO TABLET FRAME */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-5xl mx-auto rounded-[36px] bg-[#111316] p-4 sm:p-7 border-[4px] border-[#2c323a] shadow-[0_25px_80px_rgba(0,0,0,0.85)]">
        {/* Tablet Bezel Camera Dot */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#1e2329] border border-white/5" />

        {/* Tablet Internal Screen Stage */}
        <div className="relative rounded-[28px] bg-[rgba(20,23,27,0.95)] border border-white/10 p-5 sm:p-8 overflow-hidden backdrop-blur-2xl">
          {/* Top Admin Studio Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sage/15 border border-sage/30 flex items-center justify-center text-sage">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink tracking-tight">Dish360 Kitchen Studio</span>
                  <span className="px-2 py-0.5 rounded-full bg-sage/20 text-sage text-[10px] font-mono font-bold">
                    iPadOS 18
                  </span>
                </div>
                <div className="text-[11px] text-ink-muted font-mono">Aurelia Bistro & Grill // Service Line #01</div>
              </div>
            </div>

            {/* Cloud Sync Status Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-solid hover:bg-sage text-charcoal text-xs font-bold shadow-sage-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing 50 Tables..." : "Push to All QR Tables"}</span>
              </button>
            </div>
          </div>

          {/* Dual Column: Interactive Live Controls (Left) + Live Synchronized Preview Canvas (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Culinary Admin Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* 1. Live Interactive Price Slider */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-sage" />
                    <span className="text-xs font-bold text-ink">Dynamic Price Modulation</span>
                  </div>
                  <span className="text-base font-black text-sage font-mono">
                    ${dishPrice}.00
                  </span>
                </div>

                <input
                  type="range"
                  min="18"
                  max="38"
                  step="1"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(Number(e.target.value))}
                  className="w-full h-2 bg-charcoal-light rounded-lg appearance-none cursor-pointer accent-sage"
                />

                <div className="flex justify-between text-[10px] font-mono text-ink-muted mt-2">
                  <span>Base Min: $18.00</span>
                  <span>Target Margin: +68%</span>
                  <span>Max: $38.00</span>
                </div>
              </div>

              {/* 2. Emergency 86'd / Sold Out Instant Switch */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${is86d ? "text-rose-400" : "text-amber-400"}`} />
                    <span className="text-xs font-bold text-ink">86'd Emergency Item Toggle</span>
                  </div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    Instantly marks dish unavailable across all 50 dining table QR standees.
                  </div>
                </div>

                <button
                  onClick={() => setIs86d(!is86d)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md active:scale-95 ${
                    is86d
                      ? "bg-rose-500/20 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                      : "bg-sage/20 border border-sage/40 text-sage"
                  }`}
                >
                  {is86d ? "86'd // SOLD OUT" : "IN STOCK (12 LEFT)"}
                </button>
              </div>

              {/* 3. Kitchen & Dining Ambient Lighting Studio */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-sage" />
                  <span className="text-xs font-bold text-ink">AR Environment Light Simulator</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLightingMode("candlelight")}
                    className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      lightingMode === "candlelight"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                        : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="text-[11px]">Candlelight</span>
                    <span className="text-[9px] font-mono opacity-70">2200K Warm</span>
                  </button>

                  <button
                    onClick={() => setLightingMode("midday")}
                    className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      lightingMode === "midday"
                        ? "bg-amber-200/20 border-amber-200/50 text-amber-100 shadow-[0_0_12px_rgba(254,240,138,0.3)]"
                        : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="text-[11px]">Midday Sun</span>
                    <span className="text-[9px] font-mono opacity-70">5500K Neutral</span>
                  </button>

                  <button
                    onClick={() => setLightingMode("spotlight")}
                    className={`p-2.5 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      lightingMode === "spotlight"
                        ? "bg-sage/20 border-sage/50 text-sage shadow-[0_0_12px_rgba(170,208,175,0.3)]"
                        : "bg-white/5 border-white/5 text-ink-muted hover:text-ink"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[11px]">Bistro Spot</span>
                    <span className="text-[9px] font-mono opacity-70">3200K Dramatic</span>
                  </button>
                </div>
              </div>

              {/* 4. Live Modifier Upsell Toggles */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="text-xs font-bold text-ink mb-2">Live Ingredient Modifiers (AOV Boosters)</div>
                <label className="flex items-center justify-between cursor-pointer py-1.5">
                  <span className="text-xs text-ink-soft">Add Shaved Norcia Black Truffle (+$5.00)</span>
                  <input
                    type="checkbox"
                    checked={extraTruffle}
                    onChange={(e) => setExtraTruffle(e.target.checked)}
                    className="w-4 h-4 rounded accent-sage cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Right Column: Synchronized Real-Time WebAR Output Mirror */}
            <div className="lg:col-span-6 relative flex flex-col items-center">
              <div className="w-full p-4 rounded-2xl bg-black/60 border border-white/10 relative overflow-hidden">
                {/* Header Status */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono">
                  <div className="flex items-center gap-2 text-sage">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>TABLE_AR_MIRROR_SYNC</span>
                  </div>
                  <span className="text-ink-muted">50 Tables Connected</span>
                </div>

                {/* Simulated AR Viewer Box */}
                <div
                  className={`relative aspect-[4/3] w-full rounded-xl mt-3 flex items-center justify-center overflow-hidden transition-all duration-700 ${
                    lightingMode === "candlelight"
                      ? "bg-gradient-to-tr from-[#1b1511] via-[#121417] to-[#0a0c0e]"
                      : lightingMode === "midday"
                      ? "bg-gradient-to-tr from-[#252a30] via-[#181d22] to-[#101316]"
                      : "bg-gradient-to-tr from-[#131d1b] via-[#121417] to-[#0a0d0c]"
                  }`}
                >
                  {/* Dynamic Lighting Glow Simulation */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                      lightingMode === "candlelight"
                        ? "bg-amber-500/10"
                        : lightingMode === "midday"
                        ? "bg-amber-100/10"
                        : "bg-sage/15"
                    }`}
                  />

                  {/* 86'd Overlay Banner */}
                  {is86d && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-2">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-rose-300 font-mono">ITEM MARKED 86'd</div>
                      <div className="text-xs text-ink-muted max-w-xs mt-1">
                        Diners viewing this item on tables receive: "Temporarily Sold Out - Chef Recommends King Salmon".
                      </div>
                    </div>
                  )}

                  {/* 3D Dish Asset Mirror */}
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <img
                      src="/brand/dish360 logo.png"
                      alt="Synced 3D Dish"
                      className={`w-36 h-36 sm:w-44 sm:h-44 object-contain transition-all duration-500 ${
                        is86d ? "grayscale opacity-30" : "animate-float drop-shadow-[0_15px_30px_rgba(170,208,175,0.3)]"
                      }`}
                    />
                  </div>

                  {/* Synced Floating Price & Detail HUD */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-between z-20">
                    <div>
                      <div className="text-xs font-bold text-ink">A5 Wagyu Brioche</div>
                      <div className="text-[10px] text-ink-muted font-mono">
                        {extraTruffle ? "Base + Norcia Truffle" : "Standard Spec"}
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-black text-sage font-mono">
                      ${getCalculatedPrice()}.00
                    </div>
                  </div>
                </div>

                {/* Synced Success Alert */}
                <AnimatePresence>
                  {syncedRecently && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Sync Successful: All 50 QR table standees updated in 0.4s!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Advance to Act 5 */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Sparkles className="w-4 h-4 text-sage" />
            <span>The kitchen is dialed in. Now examine the business impact & bottom-line ROI.</span>
          </div>

          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal text-xs font-semibold shadow-sage-glow transition-all hover:scale-105"
          >
            <span>View Restaurant ROI & Standee Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
