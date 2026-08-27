"use client";

import React, { useState } from "react";
import {
  Box,
  Sliders,
  Sun,
  Layers,
  Rotate3d,
  Download,
  QrCode,
  Sparkles,
  Check,
  Flame,
  FileCode,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DishPreset {
  id: string;
  name: string;
  category: string;
  price: string;
  calories: string;
  allergens: string[];
  description: string;
  colorTint: string;
  polygonCount: string;
}

const PRESETS: DishPreset[] = [
  {
    id: "burger",
    name: "Wagyu Truffle Artisan Burger",
    category: "Signature Mains",
    price: "$24.00",
    calories: "520 kcal",
    allergens: ["Dairy", "Gluten", "Egg"],
    description: "Dry-aged A5 Wagyu beef patty, shaved black summer truffle, melted Gruyère.",
    colorTint: "from-amber-600/30 to-amber-900/10",
    polygonCount: "16,420 polygons",
  },
  {
    id: "salmon",
    name: "Flame-Seared King Salmon Tataki",
    category: "Raw Bar & Starters",
    price: "$28.50",
    calories: "380 kcal",
    allergens: ["Fish", "Sesame", "Soy"],
    description: "Ora King salmon, yuzu ponzu reduction, micro shiso, charred scallion oil.",
    colorTint: "from-rose-500/30 to-orange-900/10",
    polygonCount: "14,800 polygons",
  },
  {
    id: "matcha",
    name: "Kyoto Ceremonial Matcha Delice",
    category: "Pastry & Desserts",
    price: "$16.00",
    calories: "290 kcal",
    allergens: ["Dairy", "Gluten"],
    description: "Uji ceremonial matcha mousse, dark chocolate crisp, gold leaf flake.",
    colorTint: "from-emerald-600/30 to-teal-900/10",
    polygonCount: "12,200 polygons",
  },
  {
    id: "cocktail",
    name: "Smoked Rosemary Old Fashioned",
    category: "Craft Bar",
    price: "$18.00",
    calories: "180 kcal",
    allergens: ["Alcohol"],
    description: "Small-batch rye bourbon, torched rosemary sprig, aromatic house bitters.",
    colorTint: "from-amber-500/30 to-red-900/10",
    polygonCount: "9,600 polygons",
  },
];

export default function MenuBuilderStudio() {
  const [selectedPreset, setSelectedPreset] = useState<DishPreset>(PRESETS[0]);
  const [lightingMode, setLightingMode] = useState<"warm" | "daylight" | "bistro">("warm");
  const [rotation, setRotation] = useState(30);
  const [isWireframe, setIsWireframe] = useState(false);
  const [restaurantName, setRestaurantName] = useState("Le Petit Bistro");
  const [tableNumber, setTableNumber] = useState("12");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = (type: string) => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <section id="studio" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-sage/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
          <Box className="w-3.5 h-3.5 text-sage" />
          <span>The Engineered Peak</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight mb-4">
          Interactive <span className="text-sage text-halftone-accent">3D Menu Studio</span>
        </h2>
        <p className="text-ink-soft text-sm sm:text-base font-light max-w-xl mx-auto">
          Test drive how restaurant managers configure lighting, dish sizing, nutritional HUDs,
          and export QR standees in real time.
        </p>
      </div>

      {/* Studio Workspace Container */}
      <div className="rounded-3xl bg-surface-elevated/85 backdrop-blur-2xl border border-white/10 shadow-glass-elevated overflow-hidden">
        {/* Top Studio Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sage/20 border border-sage/40 flex items-center justify-center text-sage">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-ink flex items-center gap-2">
                <span>Dish360 Creator Studio</span>
                <span className="px-2 py-0.5 rounded-full bg-sage/20 text-sage text-[10px] font-mono">
                  LIVE ENGINE v4.2
                </span>
              </div>
              <div className="text-xs text-ink-muted">
                Active Project: {restaurantName} · Table #{tableNumber}
              </div>
            </div>
          </div>

          {/* Preset Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 overflow-x-auto max-w-full">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPreset.id === preset.id
                    ? "bg-sage text-charcoal font-semibold shadow-sm"
                    : "text-ink-soft hover:text-white hover:bg-white/5"
                }`}
              >
                {preset.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Body: Left 3D Viewport + Right Parameter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Interactive 3D Canvas Viewport (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10 min-h-[440px] bg-gradient-to-b from-black/50 to-black/80">
            {/* Viewport HUD Overlays */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[11px] font-mono text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{selectedPreset.polygonCount}</span>
              </div>
              <div className="text-xs font-semibold text-sage bg-sage/15 px-3 py-1 rounded-full border border-sage/30">
                {selectedPreset.price}
              </div>
            </div>

            {/* Central 3D Mesh Representation */}
            <div className="my-auto flex flex-col items-center justify-center relative py-8">
              {/* Lighting Glow simulation based on lightingMode */}
              <div
                className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${
                  lightingMode === "warm"
                    ? "bg-amber-500/20"
                    : lightingMode === "daylight"
                    ? "bg-sky-400/15"
                    : "bg-orange-600/25"
                }`}
              />

              {/* 3D Food Model Simulation */}
              <motion.div
                key={selectedPreset.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  transform: `rotateY(${rotation}deg)`,
                }}
                className="relative z-10 flex items-center justify-center"
              >
                {isWireframe ? (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <svg
                      viewBox="0 0 200 200"
                      className="w-full h-full text-sage stroke-current fill-none drop-shadow-[0_0_15px_rgba(170,208,175,0.7)]"
                    >
                      <circle cx="100" cy="100" r="70" strokeWidth="1" strokeDasharray="3,3" />
                      <ellipse cx="100" cy="100" rx="80" ry="40" strokeWidth="1.2" />
                      <ellipse cx="100" cy="80" rx="70" ry="30" strokeWidth="0.8" />
                      <ellipse cx="100" cy="120" rx="70" ry="30" strokeWidth="0.8" />
                      <path d="M 30 100 Q 100 40 170 100" strokeWidth="1.2" />
                      <path d="M 30 100 Q 100 160 170 100" strokeWidth="1.2" />
                      <circle cx="100" cy="80" r="4" fill="#AAD0AF" />
                      <circle cx="60" cy="100" r="4" fill="#AAD0AF" />
                      <circle cx="140" cy="100" r="4" fill="#AAD0AF" />
                    </svg>
                  </div>
                ) : (
                  <div className="relative w-56 sm:w-64 h-56 sm:h-64 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-white/5 blur-xl" />
                    <img
                      src="/brand/dish360 logo.png"
                      alt={selectedPreset.name}
                      className="w-44 sm:w-52 h-44 sm:h-52 object-contain drop-shadow-[0_20px_35px_rgba(170,208,175,0.4)]"
                    />
                  </div>
                )}
              </motion.div>

              {/* Dish Meta Tag */}
              <div className="mt-4 text-center z-10">
                <div className="text-base font-bold text-ink">{selectedPreset.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">{selectedPreset.description}</div>
              </div>
            </div>

            {/* Bottom Viewport Angle Control Slider */}
            <div className="flex items-center gap-4 z-10 pt-4 border-t border-white/10">
              <span className="text-xs font-mono text-ink-muted whitespace-nowrap flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-sage" />
                <span>Rotation ({rotation}°)</span>
              </span>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-sage h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Studio Control Panel & Standee Exporter (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6 bg-surface/50">
            {/* Control Section 1: Lighting Environment */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-sage" />
                <span>Restaurant Ambience / Lighting</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "warm", label: "Studio Warm", temp: "3200K" },
                  { id: "daylight", label: "Daylight", temp: "5500K" },
                  { id: "bistro", label: "Dark Bistro", temp: "2700K" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLightingMode(item.id as any)}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      lightingMode === item.id
                        ? "bg-sage/20 border-sage text-white font-semibold shadow-sm"
                        : "bg-white/5 border-white/5 text-ink-muted hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-medium">{item.label}</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5">{item.temp}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Control Section 2: Render Style Toggle */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-sage" />
                <span>Shader & Mesh Inspection</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWireframe(false)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    !isWireframe
                      ? "bg-sage text-charcoal border-sage"
                      : "bg-white/5 border-white/10 text-ink-soft hover:text-white"
                  }`}
                >
                  PBR Photoreal Shader
                </button>
                <button
                  onClick={() => setIsWireframe(true)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    isWireframe
                      ? "bg-sage text-charcoal border-sage"
                      : "bg-white/5 border-white/10 text-ink-soft hover:text-white"
                  }`}
                >
                  Wireframe Mesh
                </button>
              </div>
            </div>

            {/* Control Section 3: Standee Branding Configurator */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-2 mb-3">
                <QrCode className="w-4 h-4 text-sage" />
                <span>Branded Table Standee Config</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-ink-muted block mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-ink focus:outline-none focus:border-sage"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-muted block mb-1">Table Number</label>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-ink focus:outline-none focus:border-sage"
                  />
                </div>
              </div>
              <div className="text-[11px] text-ink-muted flex items-center gap-1.5">
                <Check className="w-3 h-3 text-sage" />
                <span>QR encoded for {restaurantName} - Table #{tableNumber}</span>
              </div>
            </div>

            {/* Control Section 4: Export Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleExport("standee")}
                className="w-full py-3 rounded-full bg-sage-solid hover:bg-sage text-charcoal font-semibold text-xs flex items-center justify-center gap-2 shadow-sage-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Print-Ready PDF Standee</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExport("usdz")}
                  className="flex-1 py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 text-ink text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-sage" />
                  <span>Export USDZ</span>
                </button>
                <button
                  onClick={() => handleExport("glb")}
                  className="flex-1 py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 text-ink text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-sage" />
                  <span>Export GLB</span>
                </button>
              </div>

              {downloadSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-mono text-center"
                >
                  ✓ Export Pack Generated for {restaurantName}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
