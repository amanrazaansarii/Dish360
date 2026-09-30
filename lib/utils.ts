import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALE: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AED: "en-AE",
  SGD: "en-SG",
};

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_LOCALE);

/** Formats paise (or cents) as a price. ₹45000 → "₹450". */
export function formatMoney(minor: number, currency = "INR"): string {
  const locale = CURRENCY_LOCALE[currency] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

/** Parses what an owner types ("450", "1,250.50") into paise. */
export function parseMoney(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

/** Paise back to a plain editable number: 45000 → "450". */
export function toMajor(minor: number): string {
  return (minor / 100).toFixed(minor % 100 === 0 ? 0 : 2);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - Date.parse(iso);
  if (!Number.isFinite(diff)) return "never";

  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "48 seconds", "2 min 10 sec" — spelled out, the way the page talks. */
export function formatDuration(seconds: number): string {
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole} sec`;
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const leftover = minutes % 60;
    return leftover === 0 ? `${hours} hr` : `${hours} hr ${leftover} min`;
  }
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} sec`;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A stable 0–1 number from a string. Gives each dish the same generated
 * artwork every time without storing anything.
 */
export function seededUnit(seed: string, salt = 0): number {
  let hash = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 100000) / 100000;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** What the guest is holding, for the analytics screen. */
export function deviceFromUserAgent(
  ua: string | null,
): "iphone" | "android" | "computer" | "unknown" {
  if (!ua) return "unknown";
  if (/iphone|ipad|ipod/i.test(ua)) return "iphone";
  if (/android/i.test(ua)) return "android";
  if (/windows|macintosh|linux|cros/i.test(ua)) return "computer";
  return "unknown";
}

export const DIET_LABELS: Record<string, string> = {
  veg: "Veg",
  vegan: "Vegan",
  egg: "Contains egg",
  jain: "Jain",
  "gluten-free": "No gluten",
  "dairy-free": "No dairy",
  "nut-free": "No nuts",
  halal: "Halal",
};

export const SPICE_LABELS = ["Not spicy", "Mild", "Medium", "Hot"];

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Standard",
  enterprise: "Multi-venue",
};
