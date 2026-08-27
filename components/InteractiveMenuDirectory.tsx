"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Star,
  Flame,
  QrCode,
  Filter,
  Eye,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DishItem {
  id: string;
  name: string;
  category: "all" | "mains" | "starters" | "desserts" | "cocktails";
  categoryLabel: string;
  price: string;
  calories: string;
  rating: string;
  reviews: string;
  tags: string[];
  description: string;
}

const MENU_ITEMS: DishItem[] = [
  {
    id: "dish-1",
    name: "A5 Miyazaki Wagyu Burger",
    category: "mains",
    categoryLabel: "Signature Mains",
    price: "$26.00",
    calories: "540 kcal",
    rating: "4.9",
    reviews: "320",
    tags: ["A5 Wagyu", "Truffle Glaze", "Aged Gruyère"],
    description: "Dry-aged A5 wagyu patty with caramelized shallot butter, shaved black truffle on brioche.",
  },
  {
    id: "dish-2",
    name: "Ora King Salmon Tataki",
    category: "starters",
    categoryLabel: "Raw Bar & Starters",
    price: "$24.50",
    calories: "320 kcal",
    rating: "4.9",
    reviews: "184",
    tags: ["Gluten-Free", "Fresh Catch", "Yuzu Ponzu"],
    description: "Lightly seared king salmon with white truffle ponzu, pickled sea fennel, crispy garlic chips.",
  },
  {
    id: "dish-3",
    name: "Kyoto Matcha Silk Tart",
    category: "desserts",
    categoryLabel: "Pastry & Desserts",
    price: "$16.00",
    calories: "280 kcal",
    rating: "4.8",
    reviews: "210",
    tags: ["Vegetarian", "Uji Ceremonial", "Gold Leaf"],
    description: "Velvety ceremonial grade Uji matcha ganache in a black sesame sablé shell.",
  },
  {
    id: "dish-4",
    name: "Smoked Ember Old Fashioned",
    category: "cocktails",
    categoryLabel: "Craft Cocktails",
    price: "$18.00",
    calories: "160 kcal",
    rating: "5.0",
    reviews: "145",
    tags: ["House Rye", "Cedar Smoke", "Charred Orange"],
    description: "Small batch Kentucky bourbon infused with smoked cherrywood and toasted vanilla bean.",
  },
  {
    id: "dish-5",
    name: "Truffle Gnocchi Fritti",
    category: "starters",
    categoryLabel: "Raw Bar & Starters",
    price: "$19.00",
    calories: "410 kcal",
    rating: "4.7",
    reviews: "98",
    tags: ["Vegetarian", "Black Truffle", "Parmigiano 24M"],
    description: "Handmade potato gnocchi crisped in brown butter with parmigiano emulsion and fresh black truffle.",
  },
  {
    id: "dish-6",
    name: "Valrhona Molten Fondant",
    category: "desserts",
    categoryLabel: "Pastry & Desserts",
    price: "$17.50",
    calories: "450 kcal",
    rating: "4.9",
    reviews: "176",
    tags: ["70% Valrhona", "Tahitian Vanilla", "Warm Core"],
    description: "Warm dark chocolate core flowing with Madagascar vanilla bean gelato and sea salt hazelnut praline.",
  },
];

export default function InteractiveMenuDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "mains" | "starters" | "desserts" | "cocktails"
  >("all");
  const [activeModalDish, setActiveModalDish] = useState<DishItem | null>(null);

  const filteredDishes =
    selectedCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  const categories = [
    { id: "all", label: "All Creations" },
    { id: "mains", label: "Signature Mains" },
    { id: "starters", label: "Raw Bar & Starters" },
    { id: "desserts", label: "Desserts" },
    { id: "cocktails", label: "Craft Bar" },
  ];

  return (
    <section id="menu-directory" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
          <Smartphone className="w-3.5 h-3.5 text-sage" />
          <span>Frictionless Diner Discovery</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight mb-4">
          Browse dishes in <span className="text-sage text-halftone-accent">true 3D scale</span>
        </h2>
        <p className="text-ink-soft text-sm sm:text-base font-light max-w-xl mx-auto">
          Diners can explore your full menu before visiting, eliminating ordering hesitation and
          sparking appetite.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto py-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-sage text-charcoal shadow-sage-glow"
                : "bg-surface text-ink-soft hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <motion.div
            key={dish.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="group rounded-3xl p-6 bg-surface/75 backdrop-blur-xl border border-white/10 hover:border-sage/40 shadow-glass transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Card Top: Category + Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-sage bg-sage/15 px-2.5 py-1 rounded-full border border-sage/20">
                  {dish.categoryLabel}
                </span>
                <span className="text-base font-black text-sage">{dish.price}</span>
              </div>

              {/* 3D Visual Disc Preview */}
              <div
                onClick={() => setActiveModalDish(dish)}
                className="relative h-44 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center mb-5 cursor-pointer overflow-hidden group-hover:border-sage/30 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <img
                  src="/brand/dish360 logo.png"
                  alt={dish.name}
                  className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_10px_20px_rgba(170,208,175,0.3)]"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[10px] font-mono text-sage">
                  <Eye className="w-3 h-3" />
                  <span>3D AR VIEW</span>
                </div>
              </div>

              {/* Dish Title & Description */}
              <h3 className="text-lg font-bold text-ink mb-1.5 group-hover:text-white transition-colors">
                {dish.name}
              </h3>
              <p className="text-xs text-ink-soft font-light line-clamp-2 mb-4 leading-relaxed">
                {dish.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {dish.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-ink-muted border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Calorie + Launch AR Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-ink-muted">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-ink font-semibold">{dish.rating}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>{dish.calories}</span>
                </span>
              </div>

              <button
                onClick={() => setActiveModalDish(dish)}
                className="flex items-center gap-1 text-xs font-semibold text-sage hover:text-white transition-colors"
              >
                <span>Launch AR</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive WebAR Launch Modal */}
      <AnimatePresence>
        {activeModalDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setActiveModalDish(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-[rgba(26,29,33,0.95)] border border-white/15 shadow-2xl text-center"
            >
              <button
                onClick={() => setActiveModalDish(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
                {activeModalDish.categoryLabel}
              </div>
              <h3 className="text-2xl font-black text-ink mb-1">{activeModalDish.name}</h3>
              <div className="text-base font-bold text-sage mb-6">{activeModalDish.price}</div>

              {/* Scannable AR QR Code */}
              <div className="p-6 rounded-2xl bg-white mx-auto w-56 h-56 flex flex-col items-center justify-center shadow-lg mb-6">
                <img
                  src="/brand/dish360 logo.png"
                  alt="WebAR QR"
                  className="w-36 h-36 object-contain"
                />
                <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest mt-2">
                  SCAN WITH PHONE CAMERA
                </span>
              </div>

              <p className="text-xs text-ink-soft max-w-sm mx-auto mb-6">
                Opens directly in iOS Quick Look USDZ or Android WebXR with zero app installations.
              </p>

              <button
                onClick={() => setActiveModalDish(null)}
                className="w-full py-3 rounded-full bg-sage text-charcoal font-bold text-xs shadow-sage-glow"
              >
                Close AR Inspector
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
