"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  QrCode,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsRoiHub() {
  const [tables, setTables] = useState(25);
  const [coversPerDay, setCoversPerDay] = useState(4);
  const [averageCheck, setAverageCheck] = useState(55);

  // ROI Mathematics
  const totalDailyCovers = tables * coversPerDay;
  const monthlyRevenue = totalDailyCovers * averageCheck * 30;
  // Estimated 18% - 25% order value expansion from visual AR appetite stimulation
  const estimatedAnnualBoost = monthlyRevenue * 0.22 * 12;
  // Paper menu reprinting & physical wear waste saved per year ($80 per table/year)
  const printSavingsAnnual = tables * 95;
  const totalAnnualBenefit = estimatedAnnualBoost + printSavingsAnnual;

  return (
    <section id="roi-ledger" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-sage" />
          <span>Real-Time Proof & Economic ROI</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-ink tracking-tight mb-4">
          Turn your dining tables into{" "}
          <span className="text-sage text-halftone-accent">high-revenue stages</span>.
        </h2>
        <p className="text-ink-soft text-sm sm:text-base font-light max-w-xl mx-auto">
          Diners order more when they can see true-to-scale food on their table. Calculate your
          exact return on investment below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Restaurant Telemetry Dashboard (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-surface-elevated/90 backdrop-blur-2xl border border-white/10 shadow-glass-elevated">
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-ink uppercase tracking-wider font-semibold">
                Live Restaurant Telemetry
              </span>
            </div>
            <span className="text-[11px] font-mono text-sage bg-sage/15 px-2.5 py-1 rounded-full">
              UPDATED LIVE // 24H
            </span>
          </div>

          {/* 4 Metric Chips */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-[11px] uppercase tracking-wider font-mono">Today's Scans</span>
                <QrCode className="w-4 h-4 text-sage" />
              </div>
              <div className="text-2xl font-black text-ink">1,482</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1">↑ +18.4% vs last week</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-[11px] uppercase tracking-wider font-mono">AR Dwell Time</span>
                <Clock className="w-4 h-4 text-sage" />
              </div>
              <div className="text-2xl font-black text-ink">3m 48s</div>
              <div className="text-[10px] text-sage font-mono mt-1">High engagement rate</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-[11px] uppercase tracking-wider font-mono">AOV Lift</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">+24.8%</div>
              <div className="text-[10px] text-ink-muted font-mono mt-1">Appetite stimulation</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <div className="flex items-center justify-between text-ink-muted mb-2">
                <span className="text-[11px] uppercase tracking-wider font-mono">Return Rate</span>
                <ShieldCheck className="w-4 h-4 text-sage" />
              </div>
              <div className="text-2xl font-black text-ink">&lt; 0.2%</div>
              <div className="text-[10px] text-ink-muted font-mono mt-1">Zero portion surprises</div>
            </div>
          </div>

          {/* Top Scanned Dishes Leaderboard */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
            <div className="text-xs font-semibold text-ink-soft mb-3 uppercase tracking-wider font-mono">
              Top Scanned 3D Items This Week
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { name: "Wagyu Truffle Burger", scans: "642 scans", conv: "88% ordered" },
                { name: "King Salmon Tataki", scans: "418 scans", conv: "79% ordered" },
                { name: "Kyoto Matcha Delice", scans: "294 scans", conv: "65% ordered" },
              ].map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-white/5"
                >
                  <span className="font-medium text-ink flex items-center gap-2">
                    <span className="text-sage font-mono">#{i + 1}</span>
                    <span>{dish.name}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-ink-muted">{dish.scans}</span>
                    <span className="text-emerald-400 font-semibold">{dish.conv}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive ROI Calculator Ledger (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-surface-elevated/90 backdrop-blur-2xl border border-white/10 shadow-glass-elevated flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
              <div className="text-xs font-mono text-ink uppercase tracking-wider font-semibold">
                Interactive Restaurant ROI Calculator
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                PROVEN ROI
              </span>
            </div>

            {/* Slider 1: Number of Dining Tables */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-ink-soft">Dining Tables in Restaurant</span>
                <span className="font-bold text-ink font-mono text-sm">{tables} tables</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={tables}
                onChange={(e) => setTables(Number(e.target.value))}
                className="w-full accent-sage h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 2: Daily Table Turns / Covers */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-ink-soft">Average Turns / Covers per Table / Day</span>
                <span className="font-bold text-ink font-mono text-sm">{coversPerDay} turns</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={coversPerDay}
                onChange={(e) => setCoversPerDay(Number(e.target.value))}
                className="w-full accent-sage h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Slider 3: Average Check Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-ink-soft">Average Guest Check Size ($)</span>
                <span className="font-bold text-ink font-mono text-sm">${averageCheck} / guest</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={averageCheck}
                onChange={(e) => setAverageCheck(Number(e.target.value))}
                className="w-full accent-sage h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Calculated Output Ledger Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sage/20 via-black/40 to-black/60 border border-sage/30 shadow-sage-glow">
            <div className="text-[11px] uppercase tracking-widest text-sage font-mono mb-2">
              PROJECTED ANNUAL REVENUE EXPANSION
            </div>
            <div className="text-3xl sm:text-4xl font-black text-ink mb-3">
              +${Math.round(totalAnnualBenefit).toLocaleString()}
              <span className="text-xs font-normal text-ink-muted ml-2">/ year</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-ink-muted block text-[10px]">Upsell Revenue:</span>
                <span className="font-bold text-emerald-400">
                  +${Math.round(estimatedAnnualBoost).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-ink-muted block text-[10px]">Paper Printing Saved:</span>
                <span className="font-bold text-sage">
                  +${Math.round(printSavingsAnnual).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
