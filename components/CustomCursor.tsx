"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100, currentX: -100, currentY: -100 });

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isPointer) return;

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      if (!visible) setVisible(true);

      // Check if hovering interactive elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.getAttribute("role") === "button" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("interactive-hover"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Smooth RAF cursor lag
    let animationFrameId: number;
    const render = () => {
      const p = posRef.current;
      p.currentX += (p.x - p.currentX) * 0.25;
      p.currentY += (p.y - p.currentY) * 0.25;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${p.currentX}px, ${p.currentY}px, 0) translate(-50%, -50%) scale(${
          isHovered ? 1.4 : 0.35
        })`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible, isHovered]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9999] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundColor: "#ffffff",
        mixBlendMode: "difference",
        willChange: "transform, opacity",
      }}
      aria-hidden="true"
    />
  );
}
