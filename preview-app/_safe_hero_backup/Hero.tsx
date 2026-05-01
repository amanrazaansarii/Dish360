"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Fluid wave background
function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", resize);

    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;

    const onScroll = () => {
      targetScroll = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);

    let animationFrameId: number;

    const waves = [
      {
        yOffset: 0.65,
        amplitude: 80,
        frequency: 0.002,
        speed: 1,
        colorStops: ["rgba(42,55,68,0.5)", "rgba(19,19,19,0.1)"]
      },
      {
        yOffset: 0.75,
        amplitude: 100,
        frequency: 0.003,
        speed: -1.2,
        colorStops: ["rgba(170,208,175,0.25)", "rgba(42,55,68,0.3)"]
      },
      {
        yOffset: 0.85,
        amplitude: 60,
        frequency: 0.0015,
        speed: 1.5,
        colorStops: ["rgba(143,180,149,0.3)", "rgba(19,19,19,0.8)"]
      }
    ];

    const render = () => {
      currentScroll += (targetScroll - currentScroll) * 0.08;
      if (Math.abs(targetScroll - currentScroll) < 0.1) currentScroll = targetScroll;

      ctx.clearRect(0, 0, width, height);

      const time = currentScroll * 0.0075;

      waves.forEach(wave => {
        ctx.beginPath();
        const baseHeight = height * wave.yOffset;
        
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseHeight);

        for (let x = 0; x <= width; x += 20) {
          const y = baseHeight 
            - Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude
            - Math.cos(x * wave.frequency * 0.6 - time * wave.speed * 0.8) * (wave.amplitude * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseHeight - wave.amplitude * 1.5, 0, height);
        grad.addColorStop(0, wave.colorStops[0]);
        grad.addColorStop(1, wave.colorStops[1]);
        
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none w-full h-full" 
    />
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const burgerPanRef = useRef<HTMLDivElement>(null);
  const leftCardsRef = useRef<HTMLDivElement>(null);
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { damping: 30, stiffness: 100, mass: 0.5 };
  const sX = useSpring(mouseX, spring);
  const sY = useSpring(mouseY, spring);

  const qrPX = useTransform(sX, [-0.5, 0.5], [12, -12]);
  const qrPY = useTransform(sY, [-0.5, 0.5], [8, -8]);

  const burgerPanX = useTransform(sX, [-0.5, 0.5], [80, -80]);
  const burgerPanY = useTransform(sY, [-0.5, 0.5], [40, -40]);

  const handleMouse = useCallback((e: MouseEvent) => {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const el = sectionRef.current;
    if (el) el.addEventListener("mousemove", handleMouse);
    return () => { if (el) el.removeEventListener("mousemove", handleMouse); };
  }, [handleMouse, isMobile]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 });
      tl.fromTo(headlineRef.current, { y: 50, opacity: 0, filter: "blur(8px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1 }, "-=0.4");
      tl.fromTo(subRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.5");
      tl.fromTo(phoneRef.current, { y: 80, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2 }, "-=0.6");

      gsap.to(leftCardsRef.current, {
        x: isMobile ? 60 : 160, y: 40, opacity: 0.1, scale: 0.8, rotate: -8,
        duration: 1.2, ease: "power3.inOut",
        scrollTrigger: { trigger: sectionRef.current, start: "12% top", toggleActions: "play none none reverse" }
      });

      gsap.to(qrWrapperRef.current, {
        x: isMobile ? -50 : -160, y: 40, rotate: -4, opacity: 1, scale: 1.05,
        duration: 1.2, ease: "power3.inOut",
        scrollTrigger: { trigger: sectionRef.current, start: "12% top", toggleActions: "play none none reverse" }
      });

      gsap.to(scrollTextRef.current, {
        opacity: 0, y: 20,
        scrollTrigger: { trigger: sectionRef.current, start: "12% top", end: "20% top", scrub: true }
      });

      if (window.innerWidth < 768 && burgerPanRef.current) {
        gsap.to(burgerPanRef.current, {
          x: -60, scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "50% top", scrub: 2 }
        });
        gsap.to(burgerPanRef.current, {
          x: 60, scrollTrigger: { trigger: sectionRef.current, start: "50% top", end: "bottom top", scrub: 2 }
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const bodyFont = "'Inter', sans-serif";
  const headingFont = "'Inter', sans-serif";

  return (
    <section ref={sectionRef} className="relative w-full min-h-[200vh] overflow-clip"
      style={{ backgroundColor: "#131313" }}>

      {/* SVG Filters */}
      <svg className="hidden">
        <defs>
          <filter id="h-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6 0" />
          </filter>
          <filter id="h-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3 0" />
          </filter>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>

      {/* Sticky Hero Viewport */}
      <div className="sticky top-0 h-screen flex flex-col items-center z-10">
        
      {/* Fluid Wave Background */}
      <FluidBackground />

      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <nav ref={navRef} style={{ opacity: 0, fontFamily: bodyFont }}
          className="relative mt-5 w-[94%] max-w-6xl flex items-center justify-between px-6 py-3 pointer-events-auto"
        >
          <div className="flex items-center justify-between w-full"
            style={{ borderRadius: 9999, padding: "10px 24px",
              background: "rgba(30,34,38,0.65)", backdropFilter: "blur(20px) saturate(1.3)",
              WebkitBackdropFilter: "blur(20px) saturate(1.3)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)" }}>

            {/* Logo */}
            <a href="https://dish360.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/dish360%20logo.png" alt="Dish360"
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
              <span className="text-lg font-bold" style={{ color: "#e5e2e1", fontFamily: headingFont }}>Dish360</span>
            </a>

            {/* Links */}
            <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "rgba(229,226,225,0.7)", fontFamily: bodyFont }}>
              {["Gallery", "AR Kitchen", "Recipes", "Pricing"].map(l => (
                <a key={l} href="#" className="hover:text-white transition-colors duration-200">{l}</a>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <a href="#" className="hidden md:block text-sm transition-colors duration-200"
                style={{ color: "rgba(229,226,225,0.7)", fontFamily: bodyFont }}>Login</a>
              <button className="px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300"
                style={{ background: "#8FB495", color: "#131313", fontFamily: bodyFont,
                  boxShadow: "0 4px 16px rgba(143,180,149,0.25), inset 0 1px 0 rgba(255,255,255,0.15)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(143,180,149,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(143,180,149,0.25)"; }}>
                Book Demo
              </button>
            </div>
          </div>
        </nav>
      </div>

        {/* SVG Filters for Motion Blur */}
        <svg className="hidden">
          <defs>
            <filter id="h-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6 0" />
            </filter>
            <filter id="h-blur-sm" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3 0" />
            </filter>
          </defs>
        </svg>

        {/* Headline */}
        <div className="flex flex-col items-center text-center mt-[8vh] md:mt-[10vh] px-4 z-20">
          <h1 ref={headlineRef} className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-5 tracking-tight flex flex-col items-center justify-center gap-1"
            style={{ fontFamily: headingFont, color: "#e5e2e1", opacity: 0 }}>
            <div>
              <span className="font-bold">Revolutionize</span>{" "}
              <span className="text-halftone font-black">Your</span>
            </div>
            <div>
              <span style={{ filter: "url(#h-blur-sm)", opacity: 0.9 }}>Menu</span>{" "}
              <span className="text-halftone-accent">with</span>{" "}
              <span style={{ filter: "url(#h-blur)", opacity: 0.8, color: "#aad0af" }}>AR.</span>
            </div>
          </h1>
          <p ref={subRef} className="text-base md:text-lg max-w-xl leading-relaxed mb-6"
            style={{ fontFamily: bodyFont, color: "rgba(229,226,225,0.6)", opacity: 0, fontWeight: 300 }}>
            Experience <span className="font-semibold text-[#e5e2e1]">high-fidelity 3D claymorphic</span> rendering that brings culinary craft to life before it even hits the table.
          </p>
        </div>

        {/* Phone + Cards Composition */}
        <div className="relative flex items-center justify-center flex-1 w-full max-w-5xl px-4 z-20">

          {/* Left Info Cards */}
          <div ref={leftCardsRef} className="absolute left-[4%] md:left-[8%] top-[10%] md:top-[15%] flex flex-col gap-4 z-10"
            style={{ willChange: "transform, opacity" }}>
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderRadius: 16, background: "rgba(32,36,40,0.75)", backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
              <div className="text-2xl">⭐</div>
              <div>
                <div className="text-xl font-bold" style={{ color: "#e5e2e1", fontFamily: headingFont }}>4.9</div>
                <div className="text-xs" style={{ fontFamily: bodyFont, color: "rgba(229,226,225,0.7)" }}>Ratings</div>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ borderRadius: 16, background: "rgba(32,36,40,0.75)", backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(170,208,175,0.15)" }}>
                <span style={{ color: "#aad0af", fontSize: 14 }}>🔥</span>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: "#e5e2e1", fontFamily: headingFont }}>550</div>
                <div className="text-xs" style={{ fontFamily: bodyFont, color: "rgba(229,226,225,0.7)" }}>cal</div>
              </div>
            </div>
          </div>

          {/* Central Phone Frame */}
          <div ref={phoneRef} className="relative z-20" style={{ opacity: 0 }}>
            <div className="relative w-[240px] md:w-[300px] lg:w-[340px]"
              style={{ aspectRatio: "9/19.5", borderRadius: 36, background: "#1a1d21",
                boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 3px #2a2d31, inset 0 0 0 1px rgba(255,255,255,0.05)",
                overflow: "hidden" }}>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30"
                style={{ width: "40%", height: 28, background: "#1a1d21",
                  borderRadius: "0 0 18px 18px" }}>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>

              <div className="absolute inset-[3px] overflow-hidden" style={{ borderRadius: 33, background: "#0d0f12" }}>
                <div className="absolute inset-0 z-20 pointer-events-none">
                  <div className="flex items-center justify-between px-4 pt-10">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.1)" }}>
                      <span className="text-white text-xs">✕</span>
                    </div>
                    <div className="px-3 py-1 rounded-full text-[10px] font-medium tracking-wider"
                      style={{ background: "rgba(170,208,175,0.2)", color: "#aad0af", fontFamily: bodyFont }}>
                      SCANNING...
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.1)" }}>
                      <span className="text-white text-xs">⚙</span>
                    </div>
                  </div>

                  <div className="absolute top-[35%] left-[12%] w-8 h-8"
                    style={{ borderLeft: "2px solid rgba(170,208,175,0.4)", borderTop: "2px solid rgba(170,208,175,0.4)" }} />
                  <div className="absolute top-[35%] right-[12%] w-8 h-8"
                    style={{ borderRight: "2px solid rgba(170,208,175,0.4)", borderTop: "2px solid rgba(170,208,175,0.4)" }} />
                  <div className="absolute bottom-[30%] left-[12%] w-8 h-8"
                    style={{ borderLeft: "2px solid rgba(170,208,175,0.4)", borderBottom: "2px solid rgba(170,208,175,0.4)" }} />
                  <div className="absolute bottom-[30%] right-[12%] w-8 h-8"
                    style={{ borderRight: "2px solid rgba(170,208,175,0.4)", borderBottom: "2px solid rgba(170,208,175,0.4)" }} />

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ border: "3px solid rgba(255,255,255,0.3)" }}>
                      <div className="w-10 h-10 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    </div>
                  </div>
                </div>

                {isMobile ? (
                  <div ref={burgerPanRef} className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ width: "180%", left: "-40%", top: "5%" }}>
                    <img src="/assets/hero-burger.png" alt="AR Burger" draggable={false}
                      loading="eager" fetchPriority="high"
                      className="w-full h-full object-contain select-none"
                      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))", willChange: "transform" }} />
                  </div>
                ) : (
                  <motion.div ref={burgerPanRef}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    style={{ width: "180%", left: "-40%", top: "5%",
                      x: burgerPanX, y: burgerPanY, willChange: "transform" }}>
                    <img src="/assets/hero-burger.png" alt="AR Burger" draggable={false}
                      loading="eager" fetchPriority="high"
                      className="w-full h-full object-contain select-none"
                      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }} />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* QR Card (Right) */}
          <div ref={qrWrapperRef} className="absolute right-[2%] md:right-[6%] top-[8%] md:top-[12%] z-30"
            style={{ willChange: "transform, opacity" }}>
            <motion.div style={{ x: qrPX, y: qrPY }}>
              <div className="w-[180px] md:w-[220px] flex flex-col p-4 gap-3"
              style={{ borderRadius: 20, background: "rgba(30,34,38,0.55)",
                backdropFilter: "blur(24px) saturate(1.3)", WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(170,208,175,0.15)" }}>
                  <span style={{ fontSize: 12 }}>📷</span>
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: "#e5e2e1", fontFamily: headingFont }}>Scan Dish</div>
                  <div className="text-[10px]" style={{ color: "rgba(229,226,225,0.4)", fontFamily: bodyFont }}>View in your space</div>
                </div>
              </div>

              <div className="aspect-square w-full rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-full h-full p-3 grid grid-cols-5 grid-rows-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="rounded-sm"
                      style={{ background: [0,1,2,5,6,10,12,14,18,20,21,22,23,24,4,9,15,19,3,8,16].includes(i)
                        ? "rgba(170,208,175,0.5)" : "rgba(255,255,255,0.05)",
                        borderRadius: 2 }} />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium" style={{ color: "#e5e2e1", fontFamily: bodyFont }}>Classic Smash</div>
                  <div className="text-[10px]" style={{ fontFamily: bodyFont, color: "rgba(229,226,225,0.7)" }}>Burger</div>
                </div>
                <div className="text-sm font-bold text-[#aad0af]" style={{ fontFamily: bodyFont }}>$14.99</div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div ref={scrollTextRef} className="absolute bottom-8 flex flex-col items-center gap-2 z-20">
          <span className="text-[11px] tracking-[0.2em] font-medium"
            style={{ color: "rgba(229,226,225,0.35)", fontFamily: bodyFont }}>SCROLL</span>
          <motion.div animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <svg className="w-4 h-4" fill="none" stroke="rgba(229,226,225,0.3)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Film Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[45]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", opacity: 0.35, mixBlendMode: "overlay" }} />
    </section>
  );
}
