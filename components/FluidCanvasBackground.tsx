"use client";

import React, { useEffect, useRef } from "react";

export default function FluidCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let scrollY = window.scrollY;
    let targetScrollY = scrollY;
    let time = 0;
    let animationFrameId: number;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    const waves = [
      {
        amplitude: 65,
        frequency: 0.0018,
        speed: 0.008,
        yOffset: 0.62,
        colorStart: "rgba(42, 55, 68, 0.45)",
        colorEnd: "rgba(19, 19, 19, 0.95)",
      },
      {
        amplitude: 85,
        frequency: 0.0012,
        speed: 0.006,
        yOffset: 0.72,
        colorStart: "rgba(143, 180, 149, 0.22)",
        colorEnd: "rgba(19, 19, 19, 0.98)",
      },
      {
        amplitude: 50,
        frequency: 0.0022,
        speed: 0.011,
        yOffset: 0.82,
        colorStart: "rgba(170, 208, 175, 0.15)",
        colorEnd: "rgba(19, 19, 19, 1)",
      },
    ];

    const render = () => {
      time += 1;
      scrollY += (targetScrollY - scrollY) * 0.08;

      ctx.fillStyle = "#131313";
      ctx.fillRect(0, 0, width, height);

      // Render subtle radial background ambient glow
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        50,
        width * 0.5,
        height * 0.4,
        width * 0.7
      );
      radialGlow.addColorStop(0, "rgba(42, 55, 68, 0.25)");
      radialGlow.addColorStop(0.5, "rgba(26, 30, 33, 0.15)");
      radialGlow.addColorStop(1, "rgba(19, 19, 19, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Render living waves
      waves.forEach((wave, i) => {
        ctx.beginPath();
        const baseOffset = height * wave.yOffset + (scrollY * 0.15 * (i + 1)) % height;
        const currentY = Math.min(height * 0.95, baseOffset);

        ctx.moveTo(0, height);
        ctx.lineTo(0, currentY);

        for (let x = 0; x <= width; x += 15) {
          const y =
            currentY +
            Math.sin(x * wave.frequency + time * wave.speed + i) * wave.amplitude +
            Math.cos(x * (wave.frequency * 0.7) - time * (wave.speed * 0.5)) *
              (wave.amplitude * 0.4);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, currentY - wave.amplitude, 0, height);
        grad.addColorStop(0, wave.colorStart);
        grad.addColorStop(1, wave.colorEnd);

        ctx.fillStyle = grad;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
