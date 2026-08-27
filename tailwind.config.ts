import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#131313",
        surface: {
          DEFAULT: "rgba(30, 34, 38, 0.65)",
          elevated: "rgba(32, 36, 40, 0.75)",
          solid: "#1A1D21",
        },
        ink: {
          DEFAULT: "#E5E2E1",
          soft: "rgba(229, 226, 225, 0.6)",
          muted: "rgba(229, 226, 225, 0.4)",
        },
        sage: {
          DEFAULT: "#AAD0AF",
          solid: "#8FB495",
          dark: "#4C644D",
          glow: "rgba(170, 208, 175, 0.25)",
        },
        charcoal: {
          DEFAULT: "#131313",
          light: "#2A3744",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "'Plus Jakarta Sans'", "sans-serif"],
        heading: ["var(--font-inter)", "sans-serif"],
        serif: ["'Instrument Serif'", "'Playfair Display'", "serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        "glass-elevated": "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "sage-glow": "0 0 30px rgba(170, 208, 175, 0.3)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        scanline: "scanline 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
