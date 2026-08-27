"use client";

import React, { useState, useRef } from "react";
import {
  Sparkles,
  Smartphone,
  Eye,
  Layers,
  RotateCcw,
  CheckCircle2,
  Zap,
  ArrowRight,
  Flame,
  Star,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

export default function Hero() {
  const [activeViewMode, setActiveViewMode] = useState<"textured" | "wireframe" | "hud">("textured");
  const [rotationAngle, setRotationAngle] = useState(15);
  const [isDragging, setIsDragging] = useState(false);
  const [arModalOpen, setArModalOpen] = useState(false);
  const [hudPinned, setHudPinned] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentRotationRef = useRef(15);

  // Mouse tilt physics using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Layered 3D parallax transforms
  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-12, 12]);
  const cardTranslateX = useTransform(smoothMouseX, [-0.5, 0.5], [-16, 16]);
  const cardTranslateY = useTransform(smoothMouseY, [-0.5, 0.5], [-12, 12]);
  const qrTranslateX = useTransform(smoothMouseX, [-0.5, 0.5], [18, -18]);
  const qrTranslateY = useTransform(smoothMouseY, [-0.5, 0.5], [14, -14]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || window.innerWidth < 768) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Interactive 3D Drag Rotation on Model
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentRotationRef.current = rotationAngle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - startXRef.current;
    setRotationAngle(currentRotationRef.current + delta * 0.8);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <section
      id="ar-inspector"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Soft Glow Radial Spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-sage/10 via-slate-800/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Category Eyebrow Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="flex h-2 w-2 rounded-full bg-sage animate-pulse" />
        <span className="eyebrow-label text-ink-soft">
          Augmented Dining Infrastructure
        </span>
      </motion.div>

      {/* Hero Headline with Luxury Editorial Typography */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-4xl mx-auto mb-6"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-black tracking-[-0.035em] leading-[1.08] text-ink">
          Menus are no longer{" "}
          <span className="font-serif-luxury font-normal text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
            paper
          </span>
          .<br className="hidden sm:inline" />{" "}
          They are{" "}
          <span className="highlight-pill-sage">
            <span className="text-sage-luminous tracking-tight">
              living 3D tables
            </span>
          </span>
          .
        </h1>
      </motion.div>

      {/* Sub-headline Copy */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="text-base sm:text-lg md:text-xl font-light text-ink-soft max-w-2xl text-center mb-10 leading-[1.65]"
      >
        Replace flat photos and PDFs with true-to-scale WebAR dishes. Diners scan a table QR
        standee to view food in augmented reality —{" "}
        <strong className="text-ink font-semibold">zero app downloads required</strong>.
      </motion.p>

      {/* CTA Group */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="flex flex-wrap items-center justify-center gap-4 mb-16 z-20"
      >
        <button
          onClick={() => setArModalOpen(true)}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal font-semibold text-xs tracking-wide shadow-[0_4px_20px_rgba(143,180,149,0.35)] hover:shadow-[0_8px_30px_rgba(143,180,149,0.55)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Live WebAR Demo</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        <a
          href="#studio"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-surface hover:bg-white/10 text-ink hover:text-white font-medium text-xs tracking-wide border border-white/10 shadow-glass transition-all duration-200 hover:border-white/20"
        >
          <Sparkles className="w-4 h-4 text-sage" />
          <span>Launch 3D Menu Builder</span>
        </a>
      </motion.div>

      {/* ========================================================================= */}
      {/* SIGNATURE MOVE A: LIVE OPERABLE 3D FOOD & AR TABLE INSPECTOR STAGE */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1200,
        }}
        className="relative w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-8 bg-surface/70 backdrop-blur-2xl border border-white/10 shadow-glass-elevated"
      >
        {/* Top Viewport Header HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-[11px] font-mono tabular-nums text-sage">
              <span className="w-1.5 h-1.5 rounded-full bg-sage animate-ping" />
              <span>LIVE_WEBAR_VIEWPORT // 60 FPS</span>
            </div>
            <span className="hidden sm:inline-block text-xs font-medium text-ink-muted">
              Wagyu Truffle Artisan Burger (v4.2 Mesh)
            </span>
          </div>

          {/* Interactive Inspection Mode Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/40 border border-white/10">
            <button
              onClick={() => setActiveViewMode("textured")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all ${
                activeViewMode === "textured"
                  ? "bg-sage text-charcoal shadow-sm font-semibold"
                  : "text-ink-soft hover:text-white"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Textured</span>
            </button>

            <button
              onClick={() => setActiveViewMode("wireframe")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all ${
                activeViewMode === "wireframe"
                  ? "bg-sage text-charcoal shadow-sm font-semibold"
                  : "text-ink-soft hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Wireframe</span>
            </button>

            <button
              onClick={() => setHudPinned(!hudPinned)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all ${
                hudPinned ? "bg-white/15 text-white" : "text-ink-muted hover:text-white"
              }`}
            >
              <Sparkles className="w-3 h-3 text-sage" />
              <span>HUD Pins</span>
            </button>
          </div>
        </div>

        {/* 3D Canvas Stage Container */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-[380px] sm:h-[460px] md:h-[500px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl my-4"
          style={{
            background:
              "radial-gradient(circle at center, rgba(42, 55, 68, 0.4) 0%, rgba(20, 24, 28, 0.95) 75%)",
          }}
        >
          {/* Animated Ambient Table Ground Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(170, 208, 175, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(170, 208, 175, 0.2) 1px, transparent 1px)`,
              backgroundSize: "36px 36px",
              transform: "perspective(400px) rotateX(60deg) translateY(80px) scale(2)",
            }}
          />

          {/* AR Target Reticle Ring */}
          <div className="absolute w-72 h-72 rounded-full border border-dashed border-sage/30 animate-[spin_40s_linear_infinite] pointer-events-none" />
          <div className="absolute w-84 h-84 rounded-full border border-white/5 pointer-events-none" />

          {/* 3D Food Asset Display with Interactive Drag & Rotation */}
          <div
            className="relative z-10 transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
              transform: `rotateY(${rotationAngle}deg) scale(1.05)`,
            }}
          >
            {activeViewMode === "wireframe" ? (
              /* Wireframe Polygon Hologram Mode */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full text-sage stroke-current fill-none"
                  style={{ filter: "drop-shadow(0 0 12px rgba(170, 208, 175, 0.8))" }}
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
                <div className="absolute bottom-2 px-3 py-1 rounded-full bg-sage/20 border border-sage/40 text-[10px] font-mono tabular-nums text-sage">
                  POLYGON_MESH // 14,280 VERTS
                </div>
              </div>
            ) : (
              /* Photorealistic Textured 3D Dish Viewport */
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
                {/* Plate Reflection Disc */}
                <div className="absolute bottom-4 w-60 h-20 bg-gradient-to-t from-white/10 via-transparent to-transparent rounded-full blur-sm" />

                <div className="relative w-56 sm:w-72 h-56 sm:h-72 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/brand/dish360 logo.png"
                    alt="3D Dish360 WebAR Dish"
                    className="w-48 sm:w-60 h-48 sm:h-60 object-contain drop-shadow-[0_15px_30px_rgba(170,208,175,0.3)] animate-float"
                  />
                </div>
              </div>
            )}

            {/* Interactive Calorie & Ingredient HUD Pins */}
            {hudPinned && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-4 -left-6 sm:left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated/90 border border-white/10 shadow-glass backdrop-blur-md"
                >
                  <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center">
                    <Flame className="w-3 h-3 text-sage" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                      Energy
                    </div>
                    <div className="text-xs font-bold text-ink font-mono tabular-nums">520 kcal</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="absolute bottom-8 -right-4 sm:right-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-elevated/90 border border-white/10 shadow-glass backdrop-blur-md"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                      Culinary Spec
                    </div>
                    <div className="text-xs font-bold text-ink">A5 Wagyu · Truffle</div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* THE TRANSLUCENT FUTURISTIC QR CARD (DESIGN SPEC §7) */}
          {/* ========================================================================= */}
          <motion.div
            style={{
              x: qrTranslateX,
              y: qrTranslateY,
            }}
            onClick={() => setArModalOpen(true)}
            className="absolute right-3 sm:right-6 bottom-4 sm:bottom-6 z-30 w-44 sm:w-52 p-3.5 rounded-[20px] bg-[rgba(30,34,38,0.6)] backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] cursor-pointer hover:border-sage/50 transition-all duration-300 group"
          >
            {/* Header row: Sage icon chip + Title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(170,208,175,0.15)] flex items-center justify-center text-sage">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-ink group-hover:text-sage transition-colors">
                  Instant Table AR
                </div>
                <div className="text-[10px] text-ink-muted">Scan with iPhone/Android</div>
              </div>
            </div>

            {/* Inset QR Matrix */}
            <div className="p-2 rounded-xl bg-black/40 border border-white/5 mb-3 flex items-center justify-center">
              <div className="grid grid-cols-5 gap-1 w-24 h-24 p-1">
                {[
                  1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1,
                  1,
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className={`rounded-[2px] transition-colors ${
                      val === 1
                        ? "bg-[rgba(170,208,175,0.6)] shadow-[0_0_6px_rgba(170,208,175,0.4)]"
                        : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer row: Dish name + Sage price */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
              <span className="font-medium text-ink truncate max-w-[100px]">Artisan Burger</span>
              <span className="font-bold text-sage font-mono tabular-nums">$24.00</span>
            </div>
          </motion.div>

          {/* Left Floating Stat Chip (Rating & Scan Count) */}
          <motion.div
            style={{
              x: cardTranslateX,
              y: cardTranslateY,
            }}
            className="hidden sm:flex absolute left-6 bottom-8 z-30 flex-col gap-2 p-3.5 rounded-2xl bg-surface-elevated/80 backdrop-blur-xl border border-white/10 shadow-glass"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-ink font-mono tabular-nums">4.9 / 5.0</span>
              <span className="text-[10px] text-ink-muted font-mono tabular-nums">(1,240 scans)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-sage">
              <Zap className="w-3 h-3" />
              <span>+25% Order Upsell Rate</span>
            </div>
          </motion.div>

          {/* Bottom Interactive Rotation Hint */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/5 text-[10px] font-mono tabular-nums text-ink-muted pointer-events-none">
            <RotateCcw className="w-3 h-3 text-sage animate-spin" />
            <span>DRAG TO ROTATE 360° // TAP QR FOR WEBAR</span>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
              <span>iOS Quick Look (USDZ)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
              <span>Android Chrome (WebXR / GLB)</span>
            </span>
          </div>
          <div className="text-[11px] font-mono tabular-nums text-sage">
            3D MESH WEIGHT: 2.8 MB (Optimized for 4G/5G)
          </div>
        </div>
      </motion.div>

      {/* Interactive WebAR Simulator Modal */}
      <AnimatePresence>
        {arModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setArModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[rgba(26,29,33,0.95)] border border-white/15 shadow-2xl text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-sage/15 flex items-center justify-center text-sage">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-ink mb-2">
                Live WebAR Dining Demo
              </h3>
              <p className="text-xs text-ink-soft mb-6 leading-relaxed font-light">
                Point your phone camera at this QR code to launch the real-size 3D dish on your
                table instantly.
              </p>

              {/* Scannable High-Res QR Frame */}
              <div className="relative p-6 rounded-2xl bg-white mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-lg mb-6">
                <img
                  src="/brand/dish360 logo.png"
                  alt="Dish360 AR QR"
                  className="w-36 h-36 object-contain"
                />
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest mt-2 font-mono">
                  DISH360 WEBAR LAUNCH
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-xs text-sage font-mono">
                  <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
                  <span>Compatible with iPhone Safari & Android Chrome</span>
                </div>
                <button
                  onClick={() => setArModalOpen(false)}
                  className="mt-4 w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-ink font-semibold text-xs transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
