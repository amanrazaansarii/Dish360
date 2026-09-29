"use client";

import React, { useState, useRef } from "react";
import {
  Rotate3d,
  Flame,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Eye,
  Layers,
  ArrowRight,
  Check,
  Thermometer,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function Scene3WebARImmersion() {
  const [viewMode, setViewMode] = useState<"photoreal" | "wireframe" | "flavor">("photoreal");
  const [rotationAngle, setRotationAngle] = useState(25);
  const [isDragging, setIsDragging] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [activePin, setActivePin] = useState<string | null>(null);

  const startXRef = useRef(0);
  const currentRotationRef = useRef(25);

  // Mouse tilt physics for the stage
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-10, 10]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentRotationRef.current = rotationAngle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    setRotationAngle(currentRotationRef.current + delta * 0.7);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleOrder = () => {
    setOrdered(true);
    // Fire celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#AAD0AF", "#8FB495", "#E5E2E1", "#F5F5ED"],
    });
    setTimeout(() => setOrdered(false), 4000);
  };

  const scrollToNext = () => {
    const el = document.getElementById("chef-studio");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="webar-immersion"
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Lighting Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[650px] bg-gradient-to-tr from-sage/20 via-slate-800/10 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Act 03 Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft font-mono">
          ACT 03 // DINER WEBAR IMMERSION
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
          The dish orbits in <span className="font-editorial-italic text-ink">360°</span>.
          <br />
          Appetite turns into <span className="text-sage font-editorial-italic">certainty</span>.
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base sm:text-lg text-ink-soft max-w-2xl text-center mb-12 font-light leading-relaxed font-body"
      >
        Diners rotate the true-to-scale dish, inspect macro ingredient layers, verify allergens, and order directly to their table with zero friction.
      </motion.p>

      {/* ========================================================================= */}
      {/* 3D WEBAR INTERACTIVE ORBIT STAGE */}
      {/* ========================================================================= */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
        }}
        className="relative w-full max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-[rgba(26,29,33,0.75)] backdrop-blur-2xl border border-white/10 shadow-glass-elevated"
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono text-sage">
              <Rotate3d className="w-3.5 h-3.5 animate-spin" />
              <span>DRAG_TO_ORBIT // 360° ROTATION</span>
            </div>
            <span className="text-xs font-medium text-ink-muted hidden sm:inline">
              Angle: {Math.round(rotationAngle % 360)}°
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/50 border border-white/10">
            <button
              onClick={() => setViewMode("photoreal")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "photoreal"
                  ? "bg-sage text-charcoal font-semibold shadow-sm"
                  : "text-ink-soft hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Photoreal</span>
            </button>

            <button
              onClick={() => setViewMode("wireframe")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "wireframe"
                  ? "bg-sage text-charcoal font-semibold shadow-sm"
                  : "text-ink-soft hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Wireframe</span>
            </button>

            <button
              onClick={() => setViewMode("flavor")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                viewMode === "flavor"
                  ? "bg-sage text-charcoal font-semibold shadow-sm"
                  : "text-ink-soft hover:text-white"
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Flavor Thermal</span>
            </button>
          </div>
        </div>

        {/* Orbit Stage Canvas Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-[420px] sm:h-[480px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl my-4 bg-gradient-to-b from-[#181d22] to-[#0e1114] border border-white/5"
        >
          {/* Circular Ground Target Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at center, rgba(170,208,175,0.4) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Hologram Reticle Rings */}
          <div className="absolute w-80 h-80 rounded-full border border-dashed border-sage/20 animate-[spin_50s_linear_infinite] pointer-events-none" />
          <div className="absolute w-96 h-96 rounded-full border border-white/5 pointer-events-none" />

          {/* Central 3D Dish Asset with Orbit Rotation */}
          <div
            className="relative z-10 transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
              transform: `rotateY(${rotationAngle}deg) scale(1.1)`,
            }}
          >
            {viewMode === "wireframe" ? (
              /* Wireframe Polygon Hologram */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full text-sage stroke-current fill-none"
                  style={{ filter: "drop-shadow(0 0 14px rgba(170, 208, 175, 0.8))" }}
                >
                  <circle cx="100" cy="100" r="75" strokeWidth="0.8" strokeDasharray="3,3" />
                  <ellipse cx="100" cy="100" rx="80" ry="40" strokeWidth="1" />
                  <ellipse cx="100" cy="85" rx="70" ry="30" strokeWidth="0.8" />
                  <ellipse cx="100" cy="115" rx="70" ry="30" strokeWidth="0.8" />
                  <path d="M 30 100 Q 100 40 170 100" strokeWidth="1.2" />
                  <path d="M 30 100 Q 100 160 170 100" strokeWidth="1.2" />
                  <path d="M 60 70 L 140 130" strokeWidth="0.6" strokeDasharray="2,2" />
                  <path d="M 140 70 L 60 130" strokeWidth="0.6" strokeDasharray="2,2" />
                  <circle cx="100" cy="70" r="3" fill="#AAD0AF" />
                  <circle cx="65" cy="100" r="3" fill="#AAD0AF" />
                  <circle cx="135" cy="100" r="3" fill="#AAD0AF" />
                  <circle cx="100" cy="130" r="3" fill="#AAD0AF" />
                </svg>
                <div className="absolute bottom-2 px-3 py-1 rounded-full bg-sage/20 border border-sage/40 text-[10px] font-mono text-sage">
                  POLYGON_MESH // 14,280 VERTS
                </div>
              </div>
            ) : viewMode === "flavor" ? (
              /* Thermal Flavor Profile */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <div className="relative w-60 h-60 rounded-full bg-gradient-to-tr from-rose-500/40 via-amber-500/40 to-emerald-500/30 blur-md flex items-center justify-center animate-pulse" />
                <img
                  src="/brand/dish360 logo.png"
                  alt="Flavor Thermal Dish"
                  className="absolute w-52 h-52 object-contain mix-blend-screen opacity-90 contrast-125"
                />
                <div className="absolute bottom-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                  HEAT_MAP: Savory Umami (88%) · Truffle (94%)
                </div>
              </div>
            ) : (
              /* Photoreal WebAR Viewport */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                {/* Plate Floor Glow */}
                <div className="absolute bottom-4 w-64 h-20 bg-gradient-to-t from-white/15 via-transparent to-transparent rounded-full blur-md" />

                <div className="relative w-60 sm:w-76 h-60 sm:h-76 rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_30px_50px_rgba(0,0,0,0.9)]">
                  <img
                    src="/brand/dish360 logo.png"
                    alt="Photoreal 3D Wagyu Dish"
                    className="w-52 sm:w-64 h-52 sm:h-64 object-contain animate-float filter drop-shadow-[0_15px_30px_rgba(170,208,175,0.35)]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* HOLOGRAPHIC HUD CALLOUT PINS (Spring Physics & Data Verification) */}
          {/* ========================================================================= */}

          {/* Pin 1: Energy / Calories */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === "cal" ? null : "cal");
            }}
            className="absolute top-8 left-4 sm:left-10 z-20 flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-[rgba(30,34,38,0.85)] border border-white/15 shadow-glass backdrop-blur-xl cursor-pointer hover:border-sage/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-ink-muted font-mono uppercase tracking-wider">
                Caloric Density
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink group-hover:text-sage transition-colors">
                520 kcal
              </div>
            </div>
          </motion.div>

          {/* Pin 2: Dietary & Origin */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === "origin" ? null : "origin");
            }}
            className="absolute top-8 right-4 sm:right-10 z-20 flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-[rgba(30,34,38,0.85)] border border-white/15 shadow-glass backdrop-blur-xl cursor-pointer hover:border-sage/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-ink-muted font-mono uppercase tracking-wider">
                Certified Origin
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink group-hover:text-sage transition-colors">
                A5 Miyazaki · Halal
              </div>
            </div>
          </motion.div>

          {/* Pin 3: Ingredient Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === "truffle" ? null : "truffle");
            }}
            className="absolute bottom-10 left-4 sm:left-10 z-20 flex items-center gap-2.5 p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-[rgba(30,34,38,0.85)] border border-white/15 shadow-glass backdrop-blur-xl cursor-pointer hover:border-sage/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-xl bg-sage/20 border border-sage/30 flex items-center justify-center text-sage">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-ink-muted font-mono uppercase tracking-wider">
                Finish & Glaze
              </div>
              <div className="text-xs sm:text-sm font-bold text-ink group-hover:text-sage transition-colors">
                Norcia Black Truffle
              </div>
            </div>
          </motion.div>

          {/* Pin 4: Price & Instant Table Order */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-10 right-4 sm:right-10 z-20 flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[rgba(30,34,38,0.9)] border border-sage/40 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-left pr-2 border-r border-white/10">
              <div className="text-[10px] text-ink-muted font-mono">TABLE #04</div>
              <div className="text-base sm:text-lg font-black text-sage font-mono">$24.00</div>
            </div>

            <button
              onClick={handleOrder}
              disabled={ordered}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                ordered
                  ? "bg-emerald-500 text-charcoal shadow-emerald-500/30"
                  : "bg-sage-solid hover:bg-sage text-charcoal shadow-sage-glow hover:scale-105"
              }`}
            >
              {ordered ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ordered!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order to Table</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Order Confirmation Toast Modal */}
        <AnimatePresence>
          {ordered && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-xl flex items-center justify-between text-emerald-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Order Transmitted to Kitchen Ticket #104</div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    A5 Miyazaki Wagyu Brioche · Sent directly to Chef's iPad Studio
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">STATUS: QUEUED</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Narrative Anchor to Act 4 */}
        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Sparkles className="w-4 h-4 text-sage" />
            <span>The diner is satisfied. But what happens behind the kitchen doors?</span>
          </div>

          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface hover:bg-white/10 text-ink hover:text-white text-xs font-semibold border border-white/10 shadow-glass transition-all hover:scale-105"
          >
            <span>Enter Chef's iPad Admin Studio</span>
            <ArrowRight className="w-3.5 h-3.5 text-sage" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
