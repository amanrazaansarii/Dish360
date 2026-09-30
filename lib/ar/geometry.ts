/**
 * Procedural plated-dish geometry.
 *
 * The production pipeline sends a photo to a 2D→3D service (see
 * `lib/ar/pipeline.ts`). When no such service is configured, this module builds
 * a real, true-to-scale mesh from the dish record instead — so the AR flow is
 * end-to-end functional rather than stubbed. Dimensions are metres, which is
 * what glTF and AR Quick Look both expect.
 */

import { seededUnit } from "@/lib/utils";

/**
 * Bump when the generator changes shape or colour. It feeds the model routes'
 * ETag, so an improved mesh reaches browsers that cached the previous one.
 */
export const GEOMETRY_VERSION = 2;

export interface Primitive {
  name: string;
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  /** linear-space RGB + alpha */
  baseColor: [number, number, number, number];
  metallic: number;
  roughness: number;
}

export interface DishGeometry {
  primitives: Primitive[];
  vertexCount: number;
  /** half-extents of the axis-aligned bounds, metres */
  bounds: { min: [number, number, number]; max: [number, number, number] };
}

/** sRGB hex → linear RGB, which is the space glTF baseColorFactor uses. */
function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function hexToLinear(hex: string, alpha = 1): [number, number, number, number] {
  const value = hex.replace("#", "");
  return [
    srgbToLinear(Number.parseInt(value.slice(0, 2), 16)),
    srgbToLinear(Number.parseInt(value.slice(2, 4), 16)),
    srgbToLinear(Number.parseInt(value.slice(4, 6), 16)),
    alpha,
  ];
}

interface MeshBuilder {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
}

function builder(): MeshBuilder {
  return { positions: [], normals: [], uvs: [], indices: [] };
}

function finish(
  mesh: MeshBuilder,
  name: string,
  baseColor: [number, number, number, number],
  metallic: number,
  roughness: number,
): Primitive {
  return {
    name,
    positions: new Float32Array(mesh.positions),
    normals: new Float32Array(mesh.normals),
    uvs: new Float32Array(mesh.uvs),
    indices: new Uint32Array(mesh.indices),
    baseColor,
    metallic,
    roughness,
  };
}

function normalise(x: number, y: number, z: number): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/**
 * Surface of revolution from a 2-D profile of `[radius, height]` pairs.
 * Normals are derived from the profile tangent, so the silhouette shades
 * correctly without needing to average face normals.
 */
function lathe(
  mesh: MeshBuilder,
  profile: [number, number][],
  radialSegments: number,
): void {
  const base = mesh.positions.length / 3;
  const rows = profile.length;

  for (let row = 0; row < rows; row += 1) {
    const [radius, height] = profile[row];
    const previous = profile[Math.max(0, row - 1)];
    const next = profile[Math.min(rows - 1, row + 1)];
    // Profile tangent, rotated 90° in the r/y plane, gives the surface normal.
    const tangentR = next[0] - previous[0];
    const tangentY = next[1] - previous[1];

    for (let segment = 0; segment <= radialSegments; segment += 1) {
      const theta = (segment / radialSegments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);

      mesh.positions.push(radius * cos, height, radius * sin);
      const [nx, ny, nz] = normalise(tangentY * cos, -tangentR, tangentY * sin);
      mesh.normals.push(nx, ny, nz);
      mesh.uvs.push(segment / radialSegments, row / Math.max(1, rows - 1));
    }
  }

  const stride = radialSegments + 1;
  for (let row = 0; row < rows - 1; row += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const a = base + row * stride + segment;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      mesh.indices.push(a, c, b, b, c, d);
    }
  }
}

/**
 * Dome of food sitting in the plate well. Radial noise driven by the dish seed
 * gives each dish its own silhouette — a risotto reads flatter and wider than a
 * stacked burger without either needing a bespoke model.
 */
function foodDome(
  mesh: MeshBuilder,
  options: {
    radius: number;
    height: number;
    baseY: number;
    lumpiness: number;
    seed: string;
    radialSegments: number;
    heightSegments: number;
  },
): void {
  const { radius, height, baseY, lumpiness, seed, radialSegments, heightSegments } =
    options;
  const base = mesh.positions.length / 3;

  // A few low-frequency lobes, stable per dish, shape the outline.
  const lobes = [
    { frequency: 3, phase: seededUnit(seed, 1) * Math.PI * 2, amplitude: 1 },
    { frequency: 5, phase: seededUnit(seed, 2) * Math.PI * 2, amplitude: 0.55 },
    { frequency: 8, phase: seededUnit(seed, 3) * Math.PI * 2, amplitude: 0.3 },
  ];

  const wobble = (theta: number, v: number): number => {
    let sum = 0;
    for (const lobe of lobes) {
      sum += Math.sin(theta * lobe.frequency + lobe.phase + v * 2.2) * lobe.amplitude;
    }
    // Taper the noise to zero at the apex so the top stays a clean dome.
    return 1 + sum * lumpiness * (1 - v * v);
  };

  for (let row = 0; row <= heightSegments; row += 1) {
    const v = row / heightSegments;
    // Flattened hemisphere: wide at the base, quickly rounding over.
    const phi = (v * Math.PI) / 2;
    const ringRadius = Math.cos(phi) * radius;
    const ringHeight = Math.sin(phi) * height;

    for (let segment = 0; segment <= radialSegments; segment += 1) {
      const theta = (segment / radialSegments) * Math.PI * 2;
      const scale = wobble(theta, v);
      const r = ringRadius * scale;

      mesh.positions.push(r * Math.cos(theta), baseY + ringHeight, r * Math.sin(theta));
      // Ellipsoid normal, good enough given the gentle displacement.
      const [nx, ny, nz] = normalise(
        (Math.cos(phi) * Math.cos(theta)) / radius,
        Math.sin(phi) / height,
        (Math.cos(phi) * Math.sin(theta)) / radius,
      );
      mesh.normals.push(nx, ny, nz);
      mesh.uvs.push(segment / radialSegments, v);
    }
  }

  const stride = radialSegments + 1;
  for (let row = 0; row < heightSegments; row += 1) {
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const a = base + row * stride + segment;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      mesh.indices.push(a, c, b, b, c, d);
    }
  }
}

function sphere(
  mesh: MeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  radius: number,
  segments = 12,
  rings = 8,
): void {
  const base = mesh.positions.length / 3;

  for (let ring = 0; ring <= rings; ring += 1) {
    const phi = (ring / rings) * Math.PI;
    for (let segment = 0; segment <= segments; segment += 1) {
      const theta = (segment / segments) * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      mesh.positions.push(cx + nx * radius, cy + ny * radius, cz + nz * radius);
      mesh.normals.push(nx, ny, nz);
      mesh.uvs.push(segment / segments, ring / rings);
    }
  }

  const stride = segments + 1;
  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = base + ring * stride + segment;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      mesh.indices.push(a, c, b, b, c, d);
    }
  }
}

/** A short cylinder used for stacked forms — burger patties, tart bases. */
function disc(
  mesh: MeshBuilder,
  cy: number,
  radius: number,
  thickness: number,
  segments = 40,
): void {
  lathe(
    mesh,
    [
      [0, cy],
      [radius * 0.98, cy],
      [radius, cy + thickness * 0.35],
      [radius * 0.98, cy + thickness],
      [0, cy + thickness],
    ],
    segments,
  );
}

export type DishForm = "plated" | "burger" | "layered" | "bowl" | "glass";

export interface DishGeometryInput {
  id: string;
  name: string;
  /** drives the food colour when no explicit palette is given */
  flavour: { savoury: number; sweet: number; tang: number; heat: number };
  dietTags: readonly string[];
  /** kcal nudges the portion volume, so a 780kcal plate reads heavier */
  calories: number | null;
  form?: DishForm;
}

/**
 * Guesses the vessel from the dish name.
 *
 * The owner never picks a shape — they type a dish name and upload a photo, so
 * this has to be right often enough on an ordinary café menu. It can always be
 * overridden per dish from the 3D preview.
 */
export function inferForm(name: string): DishForm {
  const text = name.toLowerCase();

  // Anything served in a glass: cold coffee, shakes, lassi, mojitos, juice.
  if (
    /shake|smoothie|lassi|mojito|cooler|juice|iced tea|cold coffee|frappe|soda|lemonade|latte|cappuccino|espresso|americano|cocktail|negroni|mocktail|beer|wine/.test(
      text,
    )
  ) {
    return "glass";
  }

  // Anything eaten out of a bowl, including most Indian gravies.
  if (
    /soup|broth|ramen|curry|gravy|masala|korma|makhani|butter chicken|dal|daal|rajma|chole|sambar|rasam|kadhi|bowl|salad|stew|risotto|halwa|kheer|payasam|ice cream|sundae|yoghurt|curd|raita/.test(
      text,
    )
  ) {
    return "bowl";
  }

  // Stacked in a bun.
  if (/burger|slider|bun maska|pav|vada pav|sandwich|patty|sub\b/.test(text)) {
    return "burger";
  }

  // Layered but not a bun: a tart, a cake, a toast, a lasagne.
  if (
    /tart|cheesecake|pastry|cake|brownie|toast|sandwich toast|lasagne|lasagna|tiramisu|waffle|pancake|club/.test(
      text,
    )
  ) {
    return "layered";
  }

  if (/brioche/.test(text)) return "burger";

  // Everything else — biryani, dosa, thali, pizza, pasta, momos, rolls,
  // tikka, kebabs, fries — reads best as a portion on a plate.
  return "plated";
}

/** Food colour taken from the flavour sliders — warm for sweet, green for tangy. */
function foodColour(input: DishGeometryInput): string {
  const { savoury, sweet, tang, heat } = input.flavour;
  if (heat > 45) return "#a8442a";
  if (sweet > 74 && tang > 70) return "#e8b64c";
  if (sweet > 74) return "#6b4430";
  if (tang > 70) return "#c2563f";
  if (savoury > 88) return "#6d4a2f";
  if (input.dietTags.includes("vegan") || input.dietTags.includes("veg")) {
    return "#5f7040";
  }
  return "#8a5a34";
}

export function buildDishGeometry(input: DishGeometryInput): DishGeometry {
  const form = input.form ?? inferForm(input.name);
  const seed = input.id;

  // Portion volume tracks calories, clamped so nothing looks absurd.
  const calorieScale = input.calories
    ? 0.85 + Math.min(1, input.calories / 800) * 0.35
    : 1;

  const primitives: Primitive[] = [];
  const food = hexToLinear(foodColour(input));
  const porcelain = hexToLinear("#e8e6e1");
  const garnishColour = hexToLinear("#7f9a52");

  if (form === "glass") {
    // Tumbler: outer wall, inner wall, and a liquid surface disc.
    const glass = builder();
    const height = 0.105;
    const radius = 0.038;
    lathe(
      glass,
      [
        [0, 0],
        [radius * 0.82, 0],
        [radius * 0.9, 0.008],
        [radius * 0.96, height * 0.4],
        [radius, height],
        [radius * 0.9, height],
        [radius * 0.86, height * 0.42],
        [radius * 0.78, 0.014],
        [0, 0.014],
      ],
      48,
    );
    primitives.push(finish(glass, "glass", hexToLinear("#f2f4f3", 0.28), 0, 0.08));

    const liquid = builder();
    const level = height * 0.72;
    disc(liquid, 0.014, radius * 0.84, level - 0.014, 44);
    primitives.push(finish(liquid, "liquid", hexToLinear("#8e2b2b", 0.82), 0, 0.15));

    // Large clear cube of ice.
    const ice = builder();
    sphere(ice, 0, level - 0.012, 0, 0.016, 10, 7);
    primitives.push(finish(ice, "ice", hexToLinear("#dff0f4", 0.45), 0, 0.05));

    // Citrus twist on the rim.
    const twist = builder();
    sphere(twist, radius * 0.7, level + 0.004, 0, 0.007, 10, 6);
    primitives.push(finish(twist, "garnish", hexToLinear("#d9a02a"), 0, 0.5));
  } else if (form === "bowl") {
    const bowl = builder();
    const outer = 0.085 * calorieScale;
    lathe(
      bowl,
      [
        [0, 0],
        [outer * 0.42, 0],
        [outer * 0.5, 0.006],
        [outer * 0.78, 0.022],
        [outer, 0.048],
        [outer * 1.02, 0.052],
        [outer * 0.95, 0.05],
        [outer * 0.72, 0.026],
        [outer * 0.44, 0.011],
        [0, 0.009],
      ],
      48,
    );
    primitives.push(finish(bowl, "bowl", porcelain, 0, 0.32));

    const contents = builder();
    foodDome(contents, {
      radius: outer * 0.82,
      height: 0.02 * calorieScale,
      baseY: 0.03,
      lumpiness: 0.05,
      seed,
      radialSegments: 44,
      heightSegments: 14,
    });
    primitives.push(finish(contents, "food", food, 0, 0.55));

    const garnish = builder();
    for (let i = 0; i < 5; i += 1) {
      const angle = seededUnit(seed, 20 + i) * Math.PI * 2;
      const distance = outer * (0.2 + seededUnit(seed, 40 + i) * 0.45);
      sphere(
        garnish,
        Math.cos(angle) * distance,
        0.05 + seededUnit(seed, 60 + i) * 0.004,
        Math.sin(angle) * distance,
        0.004 + seededUnit(seed, 80 + i) * 0.003,
        10,
        6,
      );
    }
    primitives.push(finish(garnish, "garnish", garnishColour, 0, 0.45));
  } else {
    // Plated + stacked both sit on a rimmed porcelain plate.
    const plate = builder();
    const plateRadius = 0.125;
    lathe(
      plate,
      [
        [0, 0],
        [plateRadius * 0.34, 0],
        [plateRadius * 0.4, 0.002],
        [plateRadius * 0.62, 0.006],
        [plateRadius * 0.86, 0.013],
        [plateRadius, 0.019],
        [plateRadius, 0.0205],
        [plateRadius * 0.87, 0.0155],
        [plateRadius * 0.6, 0.0095],
        [plateRadius * 0.36, 0.005],
        [0, 0.004],
      ],
      56,
    );
    primitives.push(finish(plate, "plate", porcelain, 0, 0.28));

    if (form === "layered") {
      // Pastry shell, filling in the dish's own colour, glossy flat top, and a
      // scatter of garnish — a tart or a cheesecake, not a bun.
      const discRadius = 0.05 * calorieScale;

      const shell = builder();
      lathe(
        shell,
        [
          [0, 0.0045],
          [discRadius * 0.9, 0.0045],
          [discRadius, 0.01],
          [discRadius * 1.02, 0.03],
          [discRadius * 0.94, 0.031],
          [discRadius * 0.9, 0.012],
          [0, 0.011],
        ],
        44,
      );
      primitives.push(finish(shell, "pastry", hexToLinear("#c49a63"), 0, 0.62));

      const filling = builder();
      disc(filling, 0.011, discRadius * 0.9, 0.019, 44);
      primitives.push(finish(filling, "food", food, 0.05, 0.22));

      const glaze = builder();
      disc(glaze, 0.03, discRadius * 0.88, 0.0022, 44);
      primitives.push(
        finish(glaze, "glaze", hexToLinear("#ffffff", 0.14), 0.1, 0.06),
      );

      const garnish = builder();
      for (let i = 0; i < 6; i += 1) {
        const angle = seededUnit(seed, 240 + i) * Math.PI * 2;
        const distance = discRadius * (0.25 + seededUnit(seed, 260 + i) * 0.55);
        sphere(
          garnish,
          Math.cos(angle) * distance,
          0.034,
          Math.sin(angle) * distance,
          0.0035 + seededUnit(seed, 280 + i) * 0.003,
          10,
          6,
        );
      }
      primitives.push(finish(garnish, "garnish", hexToLinear("#e8d6a8"), 0, 0.4));
    } else if (form === "burger") {
      // Bun / base, filling layers, crown.
      const stackRadius = 0.048 * calorieScale;
      const base = builder();
      disc(base, 0.008, stackRadius, 0.016, 40);
      primitives.push(finish(base, "base", hexToLinear("#c98a45"), 0, 0.6));

      const filling = builder();
      disc(filling, 0.024, stackRadius * 1.05, 0.018, 40);
      primitives.push(finish(filling, "food", food, 0, 0.42));

      const cheese = builder();
      disc(cheese, 0.041, stackRadius * 1.12, 0.004, 40);
      primitives.push(finish(cheese, "cheese", hexToLinear("#e0a93c"), 0, 0.35));

      const crown = builder();
      foodDome(crown, {
        radius: stackRadius,
        height: 0.026,
        baseY: 0.045,
        lumpiness: 0.02,
        seed,
        radialSegments: 40,
        heightSegments: 14,
      });
      primitives.push(finish(crown, "crown", hexToLinear("#c27f3c"), 0, 0.5));

      // Sesame.
      const seeds = builder();
      for (let i = 0; i < 14; i += 1) {
        const angle = seededUnit(seed, 100 + i) * Math.PI * 2;
        const distance = stackRadius * seededUnit(seed, 130 + i) * 0.8;
        const lift = Math.sqrt(Math.max(0, 1 - (distance / stackRadius) ** 2));
        sphere(
          seeds,
          Math.cos(angle) * distance,
          0.045 + lift * 0.026,
          Math.sin(angle) * distance,
          0.0022,
          8,
          5,
        );
      }
      primitives.push(finish(seeds, "sesame", hexToLinear("#efd9a8"), 0, 0.5));
    } else {
      const portion = builder();
      foodDome(portion, {
        radius: 0.055 * calorieScale,
        height: 0.026 * calorieScale,
        baseY: 0.005,
        lumpiness: 0.12,
        seed,
        radialSegments: 48,
        heightSegments: 18,
      });
      primitives.push(finish(portion, "food", food, 0, 0.48));

      // Sauce pool under the portion.
      const sauce = builder();
      lathe(
        sauce,
        [
          [0, 0.0045],
          [0.062, 0.0045],
          [0.07, 0.005],
          [0.072, 0.0048],
        ],
        44,
      );
      primitives.push(finish(sauce, "sauce", hexToLinear("#40220f", 0.9), 0, 0.2));

      const garnish = builder();
      for (let i = 0; i < 7; i += 1) {
        const angle = seededUnit(seed, 150 + i) * Math.PI * 2;
        const distance = 0.03 + seededUnit(seed, 170 + i) * 0.045;
        sphere(
          garnish,
          Math.cos(angle) * distance,
          0.008 + seededUnit(seed, 190 + i) * 0.012,
          Math.sin(angle) * distance,
          0.0035 + seededUnit(seed, 210 + i) * 0.004,
          10,
          6,
        );
      }
      primitives.push(finish(garnish, "garnish", garnishColour, 0, 0.42));
    }
  }

  let vertexCount = 0;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (const primitive of primitives) {
    vertexCount += primitive.positions.length / 3;
    for (let i = 0; i < primitive.positions.length; i += 3) {
      for (let axis = 0; axis < 3; axis += 1) {
        const value = primitive.positions[i + axis];
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }
  }

  return { primitives, vertexCount, bounds: { min, max } };
}
