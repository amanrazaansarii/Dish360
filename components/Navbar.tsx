"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Sparkles, Smartphone, Box, LineChart, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Live AR", href: "#ar-inspector", icon: Smartphone },
    { name: "How It Works", href: "#workflow", icon: Sparkles },
    { name: "3D Studio", href: "#studio", icon: Box },
    { name: "ROI Ledger", href: "#roi-ledger", icon: LineChart },
    { name: "Menu Directory", href: "#menu-directory", icon: Smartphone },
    { name: "Pricing", href: "#pricing", icon: HelpCircle },
  ];

  return (
    <>
      <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-auto">
        <div className="max-w-6xl mx-auto">
          <nav
            className={`flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full transition-all duration-300 ${
              scrolled
                ? "bg-[rgba(26,29,33,0.85)] shadow-2xl backdrop-blur-2xl border border-white/10"
                : "bg-[rgba(30,34,38,0.65)] shadow-glass backdrop-blur-xl border border-white/5"
            }`}
          >
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
              aria-label="Dish360 Home"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-sage/40 transition-colors">
                <Image
                  src="/brand/dish360 logo.png"
                  alt="Dish360 Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-ink group-hover:text-white transition-colors">
                  Dish<span className="text-sage font-extrabold">360</span>
                </span>
                <span className="text-[8.5px] uppercase tracking-[0.25em] text-ink-muted -mt-1 font-mono font-semibold">
                  WebAR Dining
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 bg-black/20 px-3 py-1 rounded-full border border-white/5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-3.5 py-1.5 text-xs font-medium tracking-normal text-ink-soft hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Right Action / CTA Button */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="#studio"
                className="group relative inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wide text-charcoal bg-sage-solid hover:bg-sage rounded-full shadow-[0_4px_16px_rgba(143,180,149,0.3)] hover:shadow-[0_6px_24px_rgba(143,180,149,0.5)] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span>Live Studio</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-ink hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-4 top-20 z-40 p-5 rounded-3xl bg-[rgba(26,29,33,0.95)] backdrop-blur-2xl border border-white/10 shadow-2xl lg:hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-ink hover:text-white hover:bg-white/5 rounded-2xl transition-colors"
                  >
                    <Icon className="w-4 h-4 text-sage" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
              <div className="pt-3 mt-2 border-t border-white/10">
                <a
                  href="#studio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-charcoal bg-sage-solid rounded-full shadow-sage-glow text-center"
                >
                  <span>Launch 3D Studio</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
