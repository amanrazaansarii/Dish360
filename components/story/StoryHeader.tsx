"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Volume2, VolumeX, ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Chapter {
  id: string;
  num: string;
  label: string;
}

const CHAPTERS: Chapter[] = [
  { id: "ambient-table", num: "01", label: "Table" },
  { id: "scan-awakening", num: "02", label: "Scan" },
  { id: "webar-immersion", num: "03", label: "WebAR" },
  { id: "chef-studio", num: "04", label: "Chef Studio" },
  { id: "roi-impact", num: "05", label: "Impact" },
];

export default function StoryHeader() {
  const [activeChapter, setActiveChapter] = useState<string>("ambient-table");
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Scroll spy for active chapter
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const chapterElements = CHAPTERS.map((ch) => ({
        id: ch.id,
        el: document.getElementById(ch.id),
      }));

      const scrollPosition = window.scrollY + window.innerHeight * 0.35;

      for (let i = chapterElements.length - 1; i >= 0; i--) {
        const item = chapterElements[i];
        if (item.el && item.el.offsetTop <= scrollPosition) {
          setActiveChapter(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Web Audio API Ambience Generator (Warm luxury dining acoustic drone & soft chimes)
  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        setTimeout(() => {
          oscNodesRef.current.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore
            }
          });
          oscNodesRef.current = [];
          setIsAudioPlaying(false);
        }, 500);
      } else {
        setIsAudioPlaying(false);
      }
    } else {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        const ctx = audioCtxRef.current;
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 1.5);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Warm chords: 110Hz (A2), 164.81Hz (E3), 220Hz (A3), 277.18Hz (C#4)
        const freqs = [110, 164.81, 220, 277.18];
        const newOscs: OscillatorNode[] = [];

        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.detune.setValueAtTime(idx * 2 - 3, ctx.currentTime);

          oscGain.gain.setValueAtTime(0.2 / freqs.length, ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(masterGain);
          osc.start();
          newOscs.push(osc);
        });

        oscNodesRef.current = newOscs;
        setIsAudioPlaying(true);
      } catch (err) {
        console.warn("Audio Context init error:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-auto">
      <div className="max-w-6xl mx-auto">
        <nav
          className={`flex items-center justify-between px-3 sm:px-5 py-2.5 rounded-full transition-all duration-300 ${
            scrolled
              ? "bg-[rgba(24,27,30,0.88)] shadow-2xl backdrop-blur-2xl border border-white/10"
              : "bg-[rgba(30,34,38,0.65)] shadow-glass backdrop-blur-xl border border-white/5"
          }`}
        >
          {/* Left: Return & Brand */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-ink-muted hover:text-ink text-xs font-mono transition-colors border border-white/5"
              title="Return to standard overview"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </Link>

            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

            <Link href="/story" className="flex items-center gap-2 group">
              <div className="relative w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-sage/40 transition-colors">
                <Image
                  src="/brand/dish360 logo.png"
                  alt="Dish360"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="text-xs font-black tracking-tight text-ink group-hover:text-white transition-colors flex items-center gap-1">
                  <span>
                    Dish<span className="text-sage">360</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-sage/20 text-sage text-[9px] font-mono font-medium">
                    STORY
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: 5-Beat Chapter Jump Pills (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-black/30 p-1 rounded-full border border-white/5">
            {CHAPTERS.map((chapter) => {
              const isActive = activeChapter === chapter.id;
              return (
                <button
                  key={chapter.id}
                  onClick={() => scrollToSection(chapter.id)}
                  className={`relative px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "text-charcoal font-semibold shadow-sm"
                      : "text-ink-muted hover:text-ink-soft hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChapterPill"
                      className="absolute inset-0 bg-sage rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 font-mono text-[10px] opacity-75">
                    {chapter.num}
                  </span>
                  <span className="relative z-10">{chapter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Audio Ambience Switcher & Live CTA */}
          <div className="flex items-center gap-2">
            {/* Audio Ambience Toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                isAudioPlaying
                  ? "bg-sage/20 border-sage/40 text-sage shadow-[0_0_12px_rgba(170,208,175,0.3)]"
                  : "bg-white/5 border-white/5 text-ink-muted hover:text-ink hover:bg-white/10"
              }`}
              title={isAudioPlaying ? "Mute dining soundscape" : "Play warm dining soundscape"}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden md:inline text-[11px]">AMBIENCE ON</span>
                  {/* Equalizer Wavelet */}
                  <span className="flex items-end gap-0.5 h-2.5">
                    <span className="w-0.5 h-2 bg-sage animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-3 bg-sage animate-[pulse_0.4s_ease-in-out_infinite_0.2s]" />
                    <span className="w-0.5 h-1.5 bg-sage animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden md:inline text-[11px]">AMBIENCE</span>
                </>
              )}
            </button>

            {/* Quick AR Launch Button */}
            <button
              onClick={() => scrollToSection("webar-immersion")}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-sage-solid hover:bg-sage text-charcoal text-xs font-semibold shadow-sage-glow hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Try AR</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
