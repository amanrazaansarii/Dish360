"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLowQuality, setIsLowQuality] = useState(false);

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection?.effectiveType === '3g' || connection?.effectiveType === '2g' || (navigator as any).deviceMemory < 4) {
      setIsLowQuality(true);
    }
    // @ts-ignore
    import('@google/model-viewer').catch(console.error);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Typography fade out as user scrolls
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // Model-viewer scale, opacity and translate
  const modelScale = useTransform(scrollYProgress, [0.1, 0.4], [0.8, 1.2]);
  const modelOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  // Move burger model to the left while QR code moves to the right
  const modelX = useTransform(scrollYProgress, [0.3, 0.6], [0, -160]);
  
  // 2D Static Image dissolving
  const imageOpacity = useTransform(scrollYProgress, [0.1, 0.3], [1, 0]);
  const imageScale = useTransform(scrollYProgress, [0.1, 0.3], [1, 0.85]);

  // QR Code slide out
  const qrX = useTransform(scrollYProgress, [0.3, 0.6], [0, 180]);
  const qrRotate = useTransform(scrollYProgress, [0.3, 0.6], [0, 8]);
  const qrOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[250vh] w-full bg-[#16191C] text-white font-sans overflow-clip">
      
      {/* --- Floating Pill Navigation Bar --- */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-50 flex items-center justify-between px-8 py-4 rounded-full border border-white/10 backdrop-blur-xl bg-[#2F3E46]/20 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Faux Icon */}
          <div className="w-8 h-8 rounded-full border-t border-l border-white/40 flex items-center justify-center transform rotate-45">
            <div className="w-2 h-2 bg-[#F5F5ED] rounded-full" />
          </div>
          <span className="text-xl font-semibold tracking-wide text-[#F5F5ED]">Dish360</span>
        </div>
        
        <div className="hidden md:flex items-center justify-center gap-10 text-sm font-medium text-[#F5F5ED]/80">
          <a href="#" className="hover:text-[#728C72] transition-colors duration-300">Features ˅</a>
          <a href="#" className="hover:text-[#728C72] transition-colors duration-300">Solutions ˅</a>
          <a href="#" className="hover:text-[#728C72] transition-colors duration-300">Pricing</a>
          <a href="#" className="hover:text-[#728C72] transition-colors duration-300">About</a>
        </div>

        <button className="px-6 py-2.5 rounded-full border border-white/20 bg-transparent hover:bg-white/5 transition-all text-[#F5F5ED] font-medium text-sm">
          Book Demo
        </button>
      </nav>

      {/* --- Organic Looping Background Waves --- */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Sage Ribbon */}
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 15, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[-15%] w-[60vw] h-[25vw] bg-[#728C72] opacity-30 blur-[90px]"
          style={{ borderRadius: "50% 50% 50% 50% / 60% 40% 60% 40%" }}
        />
        {/* Cream Ribbon */}
        <motion.div 
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[35%] right-[-10%] w-[50vw] h-[30vw] bg-[#F5F5ED] opacity-20 blur-[100px]"
          style={{ borderRadius: "40% 60% 30% 70% / 50% 50% 50% 50%" }}
        />
        {/* Dark Secondary Ribbon */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[20%] w-[70vw] h-[30vw] bg-[#404B40] opacity-40 blur-[110px]"
          style={{ borderRadius: "70% 30% 50% 50% / 40% 60% 40% 60%" }}
        />
      </div>

      {/* --- Sticky Viewport Container --- */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center pointer-events-none z-10 pt-[20vh]">
        
        {/* --- Centered Typography --- */}
        <motion.div 
          style={{ opacity: textOpacity, y: textY }}
          className="flex flex-col items-center text-center px-4 w-full max-w-4xl z-20 pointer-events-auto"
        >
          {/* Inspired by the serif font reference and homepage layout */}
          <h1 
            className="text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] mb-6 text-[#F5F5ED] drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', 'Times New Roman', serif" }}
          >
            <span className="font-semibold block">Revolutionize Your</span>
            <span className="italic font-light block my-1">Menu with AR.</span>
            <span className="font-semibold block">Experience Dish360.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#F5F5ED]/80 font-light mb-10 max-w-2xl leading-relaxed">
            Bring your dishes to life with immersive augmented reality menus. Elevate the dining experience.
          </p>
          
          <button className="px-10 py-4 rounded-full bg-[#728C72] text-[#F5F5ED] font-medium tracking-wide hover:bg-[#86A386] shadow-lg hover:scale-105 transition-all duration-300 pointer-events-auto">
            Get Started
          </button>
        </motion.div>

        {/* --- 3D Transition Area --- */}
        {/* Container positioned perfectly in the lower half to overlap bottom text */}
        <div className="absolute top-[48%] md:top-[50%] w-full flex justify-center items-center pointer-events-auto z-30">
          
          {/* QR Code Slide-Out Card */}
          <motion.div
            style={{ x: qrX, y: 0, rotate: qrRotate, opacity: qrOpacity }}
            className="absolute shrink-0 w-[240px] md:w-[280px] h-[360px] md:h-[420px] rounded-[1.5rem] border border-white/20 bg-white/5 backdrop-blur-[24px] shadow-2xl flex flex-col items-center justify-between p-6 z-10"
          >
            {/* Top Icon */}
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mt-2">
              <svg className="w-6 h-6 text-[#F5F5ED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Wine Glass Icon */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 17v4m0-4c-4.418 0-8-3.582-8-8V5h16v4c0 4.418-3.582 8-8 8z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 21h8" />
              </svg>
            </div>

            {/* QR Code Graphic Placeholder */}
            <div className="w-[80%] aspect-square bg-transparent border border-white/30 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
              <img src="/assets/reference/analytics and qr.png" alt="Dynamic QR Code" className="w-[120%] object-cover opacity-90 mix-blend-screen" />
            </div>

            {/* Bottom Text */}
            <div className="w-full text-center pb-2">
              <h3 className="text-xl text-[#F5F5ED] font-light">
                Scan to<br />view in AR
              </h3>
            </div>
          </motion.div>

          {/* Central Visual: 2D Static Image Placeholder */}
          <motion.div
            style={{ opacity: imageOpacity, scale: imageScale }}
            className="absolute z-20 w-[260px] md:w-[380px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-black/50"
          >
            <img 
              src="/assets/placeholder-dish.jpg" 
              alt="2D Dish Loading" 
              className="w-full h-full object-cover opacity-80" 
            />
          </motion.div>

          {/* Central Visual: Interactive 3D Asset */}
          <motion.div
            style={{ scale: modelScale, opacity: modelOpacity, x: modelX }}
            className="absolute z-30 w-[400px] md:w-[600px] h-[400px] md:h-[600px] drop-shadow-2xl"
          >
            {/* @ts-ignore */}
            <model-viewer
              src={isLowQuality ? "/assets/models/food-asset-low.glb" : "/assets/models/food-asset-high.glb"}
              environment-image="neutral"
              exposure="1.0"
              shadow-intensity="1.2"
              auto-rotate
              rotation-per-second="4deg"
              interaction-prompt="none"
              camera-controls
              disable-zoom
              style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            ></model-viewer>
          </motion.div>
          
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: textOpacity }}
          className="absolute bottom-6 flex flex-col items-center gap-2 text-[#F5F5ED]/50 text-sm font-light z-20 pointer-events-none"
        >
          <span>Scroll to explore</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
