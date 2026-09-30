import { seededUnit } from "@/lib/utils";

/**
 * Deterministic top-down plate illustration.
 *
 * Dish photography is the operator's to supply; until they upload one, this
 * renders a real piece of art from the dish's own data — palette from the
 * flavour profile, outline and garnish placement from a hash of the id — so
 * menus and dashboards never show an empty grey box. The palette mirrors
 * `lib/ar/geometry.ts`, so the 2-D card and the 3-D model agree.
 */

export interface DishArtProps {
  dishId: string;
  name: string;
  flavour: { savoury: number; sweet: number; tang: number; heat: number };
  dietTags?: readonly string[];
  className?: string;
  /** hides the plate ring, for tight thumbnails */
  compact?: boolean;
  /**
   * `cover` fills the box and crops (dish cards); `contain` keeps the whole
   * plate in frame, which is what tall containers like the phone mock need.
   */
  fit?: "cover" | "contain";
}

function palette(
  flavour: DishArtProps["flavour"],
  dietTags: readonly string[],
): { food: string; foodDeep: string; accent: string; sauce: string } {
  const { savoury, sweet, tang, heat } = flavour;
  if (heat > 45) {
    return { food: "#c25a36", foodDeep: "#8d3a1f", accent: "#e8a75c", sauce: "#5c2413" };
  }
  if (sweet > 74 && tang > 70) {
    return { food: "#e8b64c", foodDeep: "#b8862c", accent: "#fff0c2", sauce: "#7a5416" };
  }
  if (sweet > 74) {
    return { food: "#7c4f34", foodDeep: "#4e3020", accent: "#d8b48c", sauce: "#3a2214" };
  }
  if (tang > 70) {
    return { food: "#c2563f", foodDeep: "#8a3527", accent: "#f0c7a4", sauce: "#5a2318" };
  }
  if (savoury > 88) {
    return { food: "#7d5734", foodDeep: "#503620", accent: "#c9a670", sauce: "#3b2413" };
  }
  if (dietTags.includes("vegan") || dietTags.includes("vegetarian")) {
    return { food: "#6b7f48", foodDeep: "#44532c", accent: "#b6cc86", sauce: "#2f3a1e" };
  }
  return { food: "#96643a", foodDeep: "#603c22", accent: "#d2a879", sauce: "#3d2614" };
}

export default function DishArt({
  dishId,
  name,
  flavour,
  dietTags = [],
  className,
  compact = false,
  fit = "cover",
}: DishArtProps) {
  const colours = palette(flavour, dietTags);
  const gradientId = `dish-art-${dishId}`;

  // Lobed food outline — a closed path around 14 points whose radius wobbles.
  const lobeCount = 3 + Math.floor(seededUnit(dishId, 5) * 3);
  const phase = seededUnit(dishId, 6) * Math.PI * 2;
  const points: string[] = [];
  const steps = 40;
  for (let i = 0; i < steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const wobble =
      1 +
      Math.sin(theta * lobeCount + phase) * 0.07 +
      Math.sin(theta * (lobeCount + 3) - phase) * 0.035;
    const radius = 27 * wobble;
    points.push(
      `${(50 + Math.cos(theta) * radius).toFixed(2)},${(50 + Math.sin(theta) * radius * 0.94).toFixed(2)}`,
    );
  }

  // Coordinates are rounded to fixed-precision strings: React serialises a
  // number attribute differently on the server and the client for some floats,
  // which shows up as a hydration mismatch on every garnish dot.
  const garnish = Array.from({ length: 9 }, (_, i) => {
    const angle = seededUnit(dishId, 30 + i) * Math.PI * 2;
    const distance = 6 + seededUnit(dishId, 50 + i) * 20;
    return {
      cx: (50 + Math.cos(angle) * distance).toFixed(3),
      cy: (50 + Math.sin(angle) * distance * 0.92).toFixed(3),
      r: (1 + seededUnit(dishId, 70 + i) * 1.8).toFixed(3),
      opacity: (0.55 + seededUnit(dishId, 90 + i) * 0.4).toFixed(3),
    };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`Illustration of ${name}`}
      preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
    >
      <defs>
        <radialGradient id={`${gradientId}-bg`} cx="38%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#242a2e" />
          <stop offset="100%" stopColor="#141618" />
        </radialGradient>
        <radialGradient id={`${gradientId}-plate`} cx="36%" cy="26%" r="78%">
          <stop offset="0%" stopColor="#2f353a" />
          <stop offset="70%" stopColor="#23282c" />
          <stop offset="100%" stopColor="#191d20" />
        </radialGradient>
        <radialGradient id={`${gradientId}-food`} cx="38%" cy="30%" r="76%">
          <stop offset="0%" stopColor={colours.accent} stopOpacity="0.92" />
          <stop offset="46%" stopColor={colours.food} />
          <stop offset="100%" stopColor={colours.foodDeep} />
        </radialGradient>
        <radialGradient id={`${gradientId}-sheen`} cx="34%" cy="24%" r="34%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Oversized so the backdrop still fills the box when `contain` letterboxes. */}
      <rect x="-150" y="-150" width="400" height="400" fill={`url(#${gradientId}-bg)`} />

      {!compact && (
        <>
          <ellipse cx="50" cy="50" rx="42" ry="40" fill={`url(#${gradientId}-plate)`} />
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="40"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.4"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="33"
            ry="31"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.3"
          />
        </>
      )}

      {/* sauce pool */}
      <ellipse cx="50" cy="52" rx="30" ry="27" fill={colours.sauce} opacity="0.5" />

      <polygon points={points.join(" ")} fill={`url(#${gradientId}-food)`} />

      {garnish.map((dot, index) => (
        <circle
          key={index}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill={index % 3 === 0 ? "#aad0af" : colours.accent}
          opacity={dot.opacity}
        />
      ))}

      <ellipse cx="42" cy="40" rx="16" ry="12" fill={`url(#${gradientId}-sheen)`} />
    </svg>
  );
}
