"use client";

import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Scan,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Scene2ScanAwakening() {
  const [scanState, setScanState] = useState<"standby" | "scanning" | "lifting" | "awakened">("standby");
  const [scanProgress, setScanProgress] = useState(0);

  // Auto progression when scanning is initiated
  const handleTriggerScan = () => {
    setScanState("scanning");
    setScanProgress(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanState === "scanning") {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState("lifting");
            setTimeout(() => {
              setScanState("awakened");
            }, 1800);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const handleReset = () => {
    setScanState("standby");
    setScanProgress(0);
  };

  const scrollToNext = () => {
    const el = document.getElementById("webar-immersion");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="scan-awakening"
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[600px] bg-gradient-to-br from-sage/15 via-slate-800/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Act 02 Eyebrow Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 shadow-glass mb-6"
      >
        <span className="w-2 h-2 rounded-full bg-sage animate-ping" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft font-mono">
          ACT 02 // THE SCAN AWAKENING
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
          One glance through glass.
          <br />
          The flat page <span className="text-sage font-editorial-italic">levitates</span>.
        </h2>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base sm:text-lg text-ink-soft max-w-2xl text-center mb-12 font-light leading-relaxed font-body"
      >
        No app download. The diner raises iOS Safari or Android Chrome. Optical lock-on occurs in 380ms,
        and the 2D printed photo extrudes into zero-gravity augmented reality.
      </motion.p>

      {/* ========================================================================= */}
      {/* SCANNER VIEWPORT CANVAS STAGE */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-5xl mx-auto rounded-3xl p-6 sm:p-10 bg-[rgba(26,29,33,0.75)] backdrop-blur-2xl border border-white/10 shadow-glass-elevated">
        {/* Stage Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs font-mono">
              <Smartphone className="w-3.5 h-3.5 text-sage" />
              <span className="text-ink">OPTICAL_SENSOR:</span>
              <span className={scanState === "standby" ? "text-ink-muted" : "text-sage font-bold"}>
                {scanState === "standby" && "READY_TO_LOCK"}
                {scanState === "scanning" && `ACQUIRING [${scanProgress}%]`}
                {scanState === "lifting" && "EXTRUDING_MESH..."}
                {scanState === "awakened" && "WEBAR_LOCKED_60FPS"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {scanState === "standby" ? (
              <button
                onClick={handleTriggerScan}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage text-charcoal text-xs font-bold shadow-sage-glow hover:scale-105 active:scale-95 transition-all"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Simulate Camera Scan</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink text-xs font-mono border border-white/5 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Interaction Arena: Smartphone Viewfinder (Left) + Levitation Plate (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: The Incoming Smartphone Frame with Live Camera Viewfinder */}
          <div className="lg:col-span-6 relative flex flex-col items-center">
            {/* Phone Chassis */}
            <div className="relative w-full max-w-[320px] aspect-[9/18.5] rounded-[44px] bg-[#121417] p-3 border-[3px] border-[#2f353d] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Dynamic Island / Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1b1e22]" />
                <div className="w-2 h-2 rounded-full bg-sage/60 animate-pulse" />
              </div>

              {/* Internal Screen Viewport */}
              <div className="relative w-full h-full rounded-[36px] bg-[#0c0d0f] overflow-hidden flex flex-col justify-between p-4">
                {/* Live Camera Feed Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1c2229] to-[#0d1013] opacity-90" />

                {/* Perspective Grid representing table surface */}
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage: `linear-gradient(rgba(170,208,175,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(170,208,175,0.3) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                    transform: "perspective(300px) rotateX(45deg) translateY(60px) scale(1.5)",
                  }}
                />

                {/* Top Viewfinder UI */}
                <div className="relative z-10 pt-6 flex items-center justify-between text-[10px] font-mono text-ink-muted">
                  <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-sage">
                    WebAR Safari
                  </span>
                  <span>4K 60FPS</span>
                </div>

                {/* Center AR Scanning Laser Reticle */}
                <div className="relative z-10 aspect-square w-full rounded-2xl flex items-center justify-center p-4">
                  {/* Outer Bounding Box */}
                  <div
                    className={`relative w-44 h-44 rounded-2xl border transition-all duration-300 ${
                      scanState === "standby"
                        ? "border-white/20 border-dashed"
                        : "border-sage/80 shadow-[0_0_20px_rgba(170,208,175,0.4)]"
                    }`}
                  >
                    {/* Reticle Corners */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-sage" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-sage" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-sage" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-sage" />

                    {/* Scanning Laser Beam */}
                    {scanState === "scanning" && (
                      <motion.div
                        animate={{ y: [0, 160, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-0.5 bg-sage shadow-[0_0_12px_#AAD0AF]"
                      />
                    )}

                    {/* Center Lock Target */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {scanState === "standby" && (
                        <div className="text-center">
                          <Scan className="w-8 h-8 text-ink-muted mx-auto mb-1 animate-pulse" />
                          <span className="text-[9px] font-mono text-ink-muted uppercase tracking-widest">
                            Point at QR Standee
                          </span>
                        </div>
                      )}

                      {scanState === "scanning" && (
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full border-2 border-sage border-t-transparent animate-spin mx-auto mb-2" />
                          <span className="text-[10px] font-mono text-sage font-bold">
                            SYNCHRONIZING...
                          </span>
                        </div>
                      )}

                      {(scanState === "lifting" || scanState === "awakened") && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center text-center"
                        >
                          <div className="w-10 h-10 rounded-full bg-sage/20 border border-sage flex items-center justify-center text-sage mb-2 shadow-[0_0_15px_rgba(170,208,175,0.6)]">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-mono text-sage font-bold">
                            USDZ & GLB LOADED
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Viewfinder Tray */}
                <div className="relative z-10 pb-2">
                  <div className="p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xs">
                        ★
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-ink">Wagyu Truffle Brioche</div>
                        <div className="text-[9px] text-sage font-mono">$24.00 · Table 04</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-sage text-charcoal text-[9px] font-bold">
                      INSPECT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <span className="text-[11px] font-mono text-ink-muted mt-4 text-center">
              [ Zero-Friction WebAR // iOS Quick Look + Android WebXR ]
            </span>
          </div>

          {/* Right: The Levitation Awakening Sequence (From flat paper to 3D hologram) */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            {/* The Stage Base */}
            <div className="relative w-full max-w-md h-[400px] rounded-2xl bg-black/40 border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden">
              {/* Ground Pedestal Aura */}
              <div
                className={`absolute bottom-8 w-64 h-20 rounded-full blur-xl transition-all duration-700 ${
                  scanState === "awakened"
                    ? "bg-sage/40 scale-125"
                    : scanState === "lifting"
                    ? "bg-sage/25 scale-110"
                    : "bg-white/5 scale-90"
                }`}
              />

              {/* Glowing Concentric Extrusion Rings */}
              {(scanState === "lifting" || scanState === "awakened") && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.8, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-56 h-56 rounded-full border border-sage/40"
                  />
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [0.6, 1.2, 1.6], opacity: [0.9, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    className="w-48 h-48 rounded-full border border-sage/60"
                  />
                </div>
              )}

              {/* The Dish Element (Smooth morphing from flat to elevated 3D) */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    y:
                      scanState === "standby"
                        ? 20
                        : scanState === "scanning"
                        ? 10
                        : scanState === "lifting"
                        ? -25
                        : -35,
                    scale:
                      scanState === "standby"
                        ? 0.85
                        : scanState === "scanning"
                        ? 0.95
                        : scanState === "lifting"
                        ? 1.1
                        : 1.15,
                    rotateZ: scanState === "awakened" ? [0, 4, -4, 0] : 0,
                  }}
                  transition={{
                    duration: scanState === "awakened" ? 4 : 0.8,
                    repeat: scanState === "awakened" ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                  className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center"
                >
                  {/* Dynamic Glowing Halo */}
                  <div
                    className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${
                      scanState === "awakened"
                        ? "bg-sage/40 opacity-100"
                        : scanState === "lifting"
                        ? "bg-sage/20 opacity-80"
                        : "opacity-0"
                    }`}
                  />

                  <img
                    src="/brand/dish360 logo.png"
                    alt="Awakened 3D Dish"
                    className={`w-44 h-44 sm:w-52 sm:h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] transition-all duration-700 ${
                      scanState === "standby"
                        ? "grayscale-[30%] opacity-70"
                        : "grayscale-0 opacity-100 filter drop-shadow-[0_0_25px_rgba(170,208,175,0.4)]"
                    }`}
                  />
                </motion.div>

                {/* State Caption Pill */}
                <div className="mt-4">
                  {scanState === "standby" && (
                    <span className="text-xs font-mono text-ink-muted">
                      Status: 2D Flat Ink on Paper
                    </span>
                  )}
                  {scanState === "scanning" && (
                    <span className="text-xs font-mono text-sage animate-pulse">
                      Status: Laser Scan Frequency Lock...
                    </span>
                  )}
                  {scanState === "lifting" && (
                    <span className="text-xs font-mono text-sage font-bold">
                      Status: 3D Volumetric Mesh Levitation
                    </span>
                  )}
                  {scanState === "awakened" && (
                    <span className="px-3 py-1 rounded-full bg-sage/20 border border-sage/40 text-sage text-xs font-mono font-bold shadow-[0_0_12px_rgba(170,208,175,0.3)]">
                      ★ FULL WEBAR HOLOGRAM ACTIVE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action to Act 3 */}
        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Zap className="w-4 h-4 text-sage" />
            <span>The dish is now floating. Time for the diner to interact in 360°.</span>
          </div>

          <button
            onClick={scrollToNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal text-xs font-semibold shadow-sage-glow transition-all hover:scale-105"
          >
            <span>Enter Diner WebAR Immersion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
