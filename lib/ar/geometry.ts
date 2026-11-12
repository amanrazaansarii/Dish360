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
export const GEOMETRY_VERSION = 6;

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
  /**
   * Optional per-vertex linear RGB. When present the glTF writer emits it as
   * COLOR_0 with a white base colour, so the surface carries the browning,
   * char and crumb that one flat colour per part cannot. `baseColor` stays a
   * representative average for formats that ignore vertex colour (USDZ).
   */
  colors?: Float32Array;
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
  colors?: Float32Array,
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
    ...(colors ? { colors } : {}),
  };
}

/* ------------------------------------------------------------ surface colour

   Real food is never one colour. A bun is pale where it was cut and deep
   brown where the oven reached it; a patty is mottled with char. These
   helpers colour each vertex from where it sits on the dish, plus a little
   value noise so no two patches match. Colours are written in sRGB hex
   (what a designer would pick) and converted to linear for glTF. */

type Rgb = [number, number, number];
type Shade = (p: Rgb, n: Rgb) => Rgb;

function hex(value: string): Rgb {
  const v = value.replace("#", "");
  return [0, 2, 4].map((i) => Number.parseInt(v.slice(i, i + 2), 16) / 255) as Rgb;
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function shadeBy(c: Rgb, k: number): Rgb {
  return [Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k)];
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hash3(x: number, y: number, z: number, salt: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 2147483647) ^ salt;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

/** Smooth 3-D value noise in 0..1, one octave. */
function valueNoise(x: number, y: number, z: number, salt: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz, salt);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

/** Two octaves: broad patches with finer grain on top. `scale` is per metre. */
function grain(p: Rgb, scale: number, salt: number): number {
  const a = valueNoise(p[0] * scale, p[1] * scale, p[2] * scale, salt);
  const b = valueNoise(p[0] * scale * 2.7, p[1] * scale * 2.7, p[2] * scale * 2.7, salt + 7);
  return a * 0.65 + b * 0.35;
}

/** Colour every vertex already in `mesh`. Returns linear RGB for glTF COLOR_0. */
function paint(mesh: MeshBuilder, shade: Shade): Float32Array {
  const count = mesh.positions.length / 3;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const p: Rgb = [mesh.positions[i * 3], mesh.positions[i * 3 + 1], mesh.positions[i * 3 + 2]];
    const n: Rgb = [mesh.normals[i * 3], mesh.normals[i * 3 + 1], mesh.normals[i * 3 + 2]];
    const c = shade(p, n);
    for (let k = 0; k < 3; k += 1) out[i * 3 + k] = srgbToLinear(clamp01(c[k]) * 255);
  }
  return out;
}

/**
 * Centripetal Catmull-Rom through a lathe profile, `steps` points per span.
 * A hand-written profile has ten-odd rows; at that density the shading bands
 * visibly and the colour gradients above have nothing to land on. The
 * centripetal form passes through every original row and never loops at the
 * sharp corners (the cut face of a bun) the way the uniform form does.
 */
function smoothProfile(profile: [number, number][], steps: number): [number, number][] {
  if (profile.length < 3 || steps < 2) return profile;
  const n = profile.length;
  const at = (i: number): [number, number] => {
    if (i < 0) return [2 * profile[0][0] - profile[1][0], 2 * profile[0][1] - profile[1][1]];
    if (i >= n) return [2 * profile[n - 1][0] - profile[n - 2][0], 2 * profile[n - 1][1] - profile[n - 2][1]];
    return profile[i];
  };
  const knot = (t: number, a: [number, number], b: [number, number]) =>
    t + Math.max(1e-6, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
  const out: [number, number][] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const t0 = 0, t1 = knot(t0, p0, p1), t2 = knot(t1, p1, p2), t3 = knot(t2, p2, p3);
    for (let s = 0; s < steps; s += 1) {
      const t = t1 + ((t2 - t1) * s) / steps;
      const point: [number, number] = [0, 0];
      for (let k = 0; k < 2; k += 1) {
        const a1 = ((t1 - t) / (t1 - t0)) * p0[k] + ((t - t0) / (t1 - t0)) * p1[k];
        const a2 = ((t2 - t) / (t2 - t1)) * p1[k] + ((t - t1) / (t2 - t1)) * p2[k];
        const a3 = ((t3 - t) / (t3 - t2)) * p2[k] + ((t - t2) / (t3 - t2)) * p3[k];
        const b1 = ((t2 - t) / (t2 - t0)) * a1 + ((t - t0) / (t2 - t0)) * a2;
        const b2 = ((t3 - t) / (t3 - t1)) * a2 + ((t - t1) / (t3 - t1)) * a3;
        point[k] = ((t2 - t) / (t2 - t1)) * b1 + ((t - t1) / (t2 - t1)) * b2;
      }
      // The axis row must stay exactly on the axis or the lathe leaves a pinhole.
      out.push([Math.max(0, point[0]), point[1]]);
    }
  }
  out.push(profile[n - 1]);
  return out;
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
  /**
   * Radius multiplier per angle and row. Food is not turned on a lathe, and a
   * perfectly circular patty is the single clearest tell that a mesh was
   * generated. Keep the deviation small — the normals here come from the
   * profile tangent and ignore the wobble, which reads fine under a few
   * percent and starts to shade wrongly past about ten.
   */
  wobble?: (theta: number, row: number) => number,
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
      // The seam segment repeats theta 0 exactly, so the wobble closes.
      const scaled = wobble ? radius * wobble(theta, row) : radius;

      mesh.positions.push(scaled * cos, height, scaled * sin);
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

/**
 * Sphere with independent radii. Sesame on a real bun is a flattened teardrop
 * lying along the surface, not a ball sitting on it — spheres at this size read
 * as pinheads and catch the light in a way that looks like plastic.
 */
function ellipsoid(
  mesh: MeshBuilder,
  cx: number,
  cy: number,
  cz: number,
  rx: number,
  ry: number,
  rz: number,
  yaw: number,
  segments = 10,
  rings = 6,
): void {
  const base = mesh.positions.length / 3;
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  for (let ring = 0; ring <= rings; ring += 1) {
    const phi = (ring / rings) * Math.PI;
    for (let segment = 0; segment <= segments; segment += 1) {
      const theta = (segment / segments) * Math.PI * 2;
      const ux = Math.sin(phi) * Math.cos(theta);
      const uy = Math.cos(phi);
      const uz = Math.sin(phi) * Math.sin(theta);

      const px = ux * rx;
      const py = uy * ry;
      const pz = uz * rz;
      // Normal of a scaled sphere is the point divided by the squared radii,
      // not the unit vector — otherwise a flattened seed shades like a ball.
      const [nx, ny, nz] = normalise(ux / rx, uy / ry, uz / rz);

      mesh.positions.push(
        cx + px * cosYaw - pz * sinYaw,
        cy + py,
        cz + px * sinYaw + pz * cosYaw,
      );
      mesh.normals.push(nx * cosYaw - nz * sinYaw, ny, nx * sinYaw + nz * cosYaw);
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

/**
 * Ruffled ring, for the lettuce frilling out from under the crown.
 *
 * This is the one piece of a burger that is not a stack of cylinders, and it
 * does more work than anything else here: an irregular green edge breaking the
 * silhouette is what makes the whole thing read as a burger rather than as a
 * pile of discs, especially at thumbnail size on a phone.
 *
 * Built as a thin solid — a waved top sheet, the same sheet dropped by
 * `thickness`, and a rim joining them — so it does not vanish when a guest
 * orbits underneath it.
 */
function ruffle(
  mesh: MeshBuilder,
  options: {
    innerRadius: number;
    outerRadius: number;
    baseY: number;
    thickness: number;
    /** vertical travel of the frill, peak to trough */
    wave: number;
    lobes: number;
    seed: string;
    radialSegments: number;
  },
): void {
  const { innerRadius, outerRadius, baseY, thickness, wave, lobes, seed } = options;
  const segments = options.radialSegments;
  const rows = 4;
  const phase = seededUnit(seed, 71) * Math.PI * 2;

  // Two sheets: 0 is the upper surface, 1 the lower.
  for (let sheet = 0; sheet < 2; sheet += 1) {
    const drop = sheet === 0 ? 0 : -thickness;
    const sign = sheet === 0 ? 1 : -1;

    for (let row = 0; row < rows; row += 1) {
      const t = row / (rows - 1);
      const radius = innerRadius + (outerRadius - innerRadius) * t;

      for (let segment = 0; segment <= segments; segment += 1) {
        const theta = (segment / segments) * Math.PI * 2;
        // Frill grows toward the outer edge; the inner edge stays tucked flat
        // under the crown, which is how a leaf actually sits.
        const lift =
          Math.sin(theta * lobes + phase) * wave * t * t +
          Math.sin(theta * (lobes * 2 + 1) + phase * 1.7) * wave * 0.3 * t;

        mesh.positions.push(
          radius * Math.cos(theta),
          baseY + drop + lift,
          radius * Math.sin(theta),
        );
        // Slope of the frill tilts the normal outward; good enough for a leaf.
        const slope = Math.cos(theta * lobes + phase) * lobes * wave * t;
        const [nx, ny, nz] = normalise(-slope * Math.cos(theta), 1, -slope * Math.sin(theta));
        mesh.normals.push(nx * sign, ny * sign, nz * sign);
        mesh.uvs.push(segment / segments, t);
      }
    }
  }

  const stride = segments + 1;
  const sheetSize = rows * stride;
  const base = mesh.positions.length / 3 - sheetSize * 2;

  for (let sheet = 0; sheet < 2; sheet += 1) {
    const offset = base + sheet * sheetSize;
    for (let row = 0; row < rows - 1; row += 1) {
      for (let segment = 0; segment < segments; segment += 1) {
        const a = offset + row * stride + segment;
        const b = a + 1;
        const c = a + stride;
        const d = c + 1;
        // The lower sheet is wound the other way so it faces downward.
        if (sheet === 0) mesh.indices.push(a, c, b, b, c, d);
        else mesh.indices.push(a, b, c, b, d, c);
      }
    }
  }

  // Rim along the outer edge, closing the two sheets into a solid.
  //
  // It gets its own vertices rather than reusing the sheet edges: those carry
  // the sheets' up/down normals, which shade a vertical rim almost black
  // wherever the leaf turns edge-on to the camera — exactly at the silhouette,
  // where it is most visible.
  const rimBase = mesh.positions.length / 3;
  for (let edge = 0; edge < 2; edge += 1) {
    for (let segment = 0; segment <= segments; segment += 1) {
      const theta = (segment / segments) * Math.PI * 2;
      const lift =
        Math.sin(theta * lobes + phase) * wave +
        Math.sin(theta * (lobes * 2 + 1) + phase * 1.7) * wave * 0.3;
      mesh.positions.push(
        outerRadius * Math.cos(theta),
        baseY + lift - (edge === 0 ? 0 : thickness),
        outerRadius * Math.sin(theta),
      );
      mesh.normals.push(Math.cos(theta), 0, Math.sin(theta));
      mesh.uvs.push(segment / segments, edge);
    }
  }

  for (let segment = 0; segment < segments; segment += 1) {
    const a = rimBase + segment;
    const b = a + 1;
    const c = rimBase + stride + segment;
    const d = c + 1;
    mesh.indices.push(a, b, c, b, d, c);
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
    // A 250mm dinner plate is right for a plated dish and wrong for a burger:
    // it is served on a smaller one, and on a phone the extra porcelain pushes
    // the food down to under half the frame width. 190mm keeps the burger the
    // subject of the shot.
    const plateRadius = form === "burger" ? 0.095 : 0.125;
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
      /**
       * A burger, built the way one is actually stacked.
       *
       * Every layer is a surface of revolution with a hand-written profile
       * rather than a cylinder, because the silhouette is the whole job: at
       * thumbnail size on a phone the only thing a guest reads is the outline,
       * and a stack of equal discs reads as coins. So the bun has a rounded
       * heel and a domed crown, the patty bulges and overhangs, the cheese
       * drapes past the patty and the lettuce frills out between them.
       *
       * Radii are in metres and sized off a real 100mm burger.
       */
      const r = 0.048 * calorieScale;

      // Slight, seeded irregularity shared by the savoury layers so they look
      // like they were assembled rather than extruded.
      const wobbleFor = (salt: number, amount: number) => {
        const phase = seededUnit(seed, salt) * Math.PI * 2;
        return (theta: number) =>
          1 +
          Math.sin(theta * 3 + phase) * amount +
          Math.sin(theta * 7 + phase * 2.3) * amount * 0.45;
      };

      // --- heel: rounded underside, waist, flat cut face -------------------
      const heel = builder();
      lathe(
        heel,
        smoothProfile([
          [0, 0.0005],
          [r * 0.52, 0.0012],
          [r * 0.84, 0.0048],
          [r * 0.97, 0.0115],
          [r, 0.0165],
          [r * 0.995, 0.019],
          [r * 0.62, 0.0196],
          [0, 0.0198],
        ], 3),
        64,
        wobbleFor(40, 0.012),
      );
      // Toasted underneath, golden up the side, pale crumb where it was cut.
      const heelColours = paint(heel, (p, n) => {
        const mottle = grain(p, 85, 11);
        if (n[1] > 0.55 && p[1] > 0.0175) {
          return shadeBy(mixRgb(hex("#ecd8ad"), hex("#dcc08e"), grain(p, 240, 12)), 0.97 + 0.06 * mottle);
        }
        if (n[1] < -0.6) return shadeBy(mixRgb(hex("#a9682f"), hex("#7c4219"), mottle), 1);
        const side = mixRgb(hex("#b06d32"), hex("#dba660"), smoothstep(0.003, 0.0175, p[1]));
        return shadeBy(side, 0.86 + 0.24 * mottle);
      });
      primitives.push(finish(heel, "bun-heel", hexToLinear("#c6873f"), 0, 0.62, heelColours));

      // --- patty: overhangs the bun, domed top, charred rim ----------------
      const pattyTop = 0.0198 + 0.0145;
      const patty = builder();
      lathe(
        patty,
        smoothProfile([
          [0, 0.0198],
          [r * 0.9, 0.0202],
          [r * 1.05, 0.0238],
          [r * 1.06, 0.0292],
          [r * 0.98, pattyTop - 0.0012],
          [r * 0.6, pattyTop],
          [0, pattyTop + 0.0008],
        ], 3),
        64,
        // Kept under the cheese's narrowest point — see the note there.
        wobbleFor(44, 0.015),
      );
      // Seared crust: dark, mottled, a little redder on the pressed edge.
      const pattyColours = paint(patty, (p, n) => {
        const fine = grain(p, 420, 21);
        const broad = grain(p, 110, 22);
        const crust = mixRgb(hex("#2e1a0f"), hex("#6a4126"), fine);
        const edge = mixRgb(hex("#4a2a17"), hex("#8a5532"), fine);
        const onSide = 1 - smoothstep(0.35, 0.8, Math.abs(n[1]));
        return shadeBy(mixRgb(crust, edge, onSide), 0.85 + 0.3 * broad);
      });
      primitives.push(finish(patty, "patty", food, 0, 0.5, pattyColours));

      // --- cheese: sits on the patty and hangs over the edge ---------------
      /**
       * Two constraints fight here, and both matter.
       *
       * The skirt has to stop well above the heel, or it buries the patty and
       * nothing tells a guest there is meat in there. But it also has to stay
       * wider than the patty at *every* angle: both layers wobble, and when
       * the cheese's narrow points met the patty's wide ones the patty poked
       * through as isolated dark chunks that read as burnt bits stuck to the
       * cheese. The square slice is narrowest at the middle of each edge,
       * 1.11r; the patty, 1.06r at 1.5% wobble, never passes 1.09r. Below the
       * sagging corners is what shows as a clean band of meat.
       */
      // A slice is square, not round, and its corners sag over the patty:
      // that silhouette is the single strongest "this is a cheeseburger" cue.
      // The radius follows a superellipse (edges at 1.11r, corners at ~1.32r),
      // and every point past the patty's edge drops in proportion to how far
      // out it hangs, so the corners droop most.
      const squareness = 4;
      const sliceTurn = seededUnit(seed, 47) * Math.PI;
      const square = (theta: number) => {
        const a = theta + sliceTurn;
        const c = Math.abs(Math.cos(a)) ** squareness;
        const sn = Math.abs(Math.sin(a)) ** squareness;
        return 1 / (c + sn) ** (1 / squareness);
      };
      const cheese = builder();
      lathe(
        cheese,
        smoothProfile([
          [0, pattyTop + 0.0012],
          [r * 0.7, pattyTop + 0.0009],
          [r * 0.98, pattyTop + 0.0002],
          [r * 1.08, pattyTop - 0.0012],
          [r * 1.11, pattyTop - 0.0024],
        ], 3),
        96,
        (theta) => square(theta),
      );
      for (let i = 0; i < cheese.positions.length; i += 3) {
        const radial = Math.hypot(cheese.positions[i], cheese.positions[i + 2]);
        const over = Math.max(0, radial - r * 1.04);
        cheese.positions[i + 1] -= over * 0.55;
      }
      // Brighter where it lies flat, deeper orange where it has melted over.
      const cheeseColours = paint(cheese, (p) => {
        const radial = Math.hypot(p[0], p[2]);
        const c = mixRgb(hex("#f9cf5a"), hex("#eda52a"), smoothstep(r * 0.9, r * 1.3, radial));
        return shadeBy(c, 0.95 + 0.08 * grain(p, 160, 31));
      });
      primitives.push(finish(cheese, "cheese", hexToLinear("#e9a93a"), 0, 0.28, cheeseColours));

      // --- tomato ----------------------------------------------------------
      const tomatoBase = pattyTop + 0.0016;
      const tomato = builder();
      lathe(
        tomato,
        [
          [0, tomatoBase],
          [r * 0.94, tomatoBase],
          [r * 0.97, tomatoBase + 0.0016],
          [r * 0.94, tomatoBase + 0.0032],
          [0, tomatoBase + 0.0032],
        ],
        40,
        wobbleFor(52, 0.02),
      );
      const tomatoColours = paint(tomato, (p) => {
        const radial = Math.hypot(p[0], p[2]);
        return mixRgb(hex("#e2643f"), hex("#b0241a"), smoothstep(r * 0.45, r * 0.95, radial));
      });
      primitives.push(finish(tomato, "tomato", hexToLinear("#c0392b"), 0, 0.3, tomatoColours));

      // --- lettuce: the frill that breaks the outline ----------------------
      const lettuce = builder();
      ruffle(lettuce, {
        innerRadius: r * 0.35,
        outerRadius: r * 1.2,
        baseY: tomatoBase + 0.0042,
        thickness: 0.0012,
        wave: 0.0052,
        lobes: 9,
        seed,
        radialSegments: 64,
      });
      // Pale near the heart of the leaf, deep green at the frilled edge.
      const lettuceColours = paint(lettuce, (p) => {
        const radial = Math.hypot(p[0], p[2]);
        const c = mixRgb(hex("#a9cc62"), hex("#3f7a1e"), smoothstep(r * 0.55, r * 1.18, radial));
        return shadeBy(c, 0.88 + 0.2 * grain(p, 220, 41));
      });
      primitives.push(finish(lettuce, "lettuce", hexToLinear("#7cb33f"), 0, 0.72, lettuceColours));

      // --- crown: mushroom dome, widest just above the cut -----------------
      const crownBase = tomatoBase + 0.0052;
      const crownApex = crownBase + 0.0265;
      // Named, because the sesame below has to sit on exactly this surface.
      const crownProfile: [number, number][] = [
        [0, crownBase],
        [r * 0.6, crownBase - 0.0004],
        [r * 0.95, crownBase + 0.0002],
        [r * 1.005, crownBase + 0.0042],
        [r * 0.985, crownBase + 0.0108],
        [r * 0.9, crownBase + 0.0168],
        [r * 0.74, crownBase + 0.0218],
        [r * 0.5, crownBase + 0.0252],
        [r * 0.26, crownApex - 0.0006],
        [0, crownApex],
      ];
      const crown = builder();
      lathe(crown, smoothProfile(crownProfile, 3), 72, wobbleFor(56, 0.01));
      // The oven browns the top of a bun most and the sides least, and the cut
      // underneath stays crumb-white. That gradient is most of why a bun reads
      // as bread rather than as a brown plastic dome.
      const crownColours = paint(crown, (p, n) => {
        if (n[1] < -0.35) return mixRgb(hex("#ecd8ae"), hex("#dbc092"), grain(p, 240, 51));
        const h = clamp01((p[1] - crownBase) / (crownApex - crownBase));
        let c = mixRgb(hex("#e8c88f"), hex("#d08b3d"), smoothstep(0.0, 0.3, h));
        c = mixRgb(c, hex("#8e4c1b"), smoothstep(0.32, 1, h) * 0.78);
        return shadeBy(c, 0.86 + 0.26 * grain(p, 80, 52));
      });
      primitives.push(finish(crown, "bun-crown", hexToLinear("#c98742"), 0, 0.5, crownColours));

      // --- sesame: flattened, lying along the dome -------------------------
      /**
       * Height of the dome at a given radius, read off the profile itself.
       *
       * Worth the few lines: approximating this with a cosine puts the outer
       * seeds about a centimetre inside the bun, and they simply vanish. Only
       * the descending part of the profile is searched, since the first rows
       * climb outward from the centre and would match the wrong radius.
       */
      const crownHeightAt = (radius: number): number => {
        const descending = crownProfile.slice(3);
        for (let i = 0; i < descending.length - 1; i += 1) {
          const [r0, y0] = descending[i];
          const [r1, y1] = descending[i + 1];
          if (radius <= r0 && radius >= r1) {
            const span = r0 - r1;
            const t = span === 0 ? 0 : (r0 - radius) / span;
            return y0 + (y1 - y0) * t;
          }
        }
        return radius > descending[0][0] ? descending[0][1] : crownApex;
      };

      const seeds = builder();
      for (let i = 0; i < 24; i += 1) {
        // Biased toward the top of the dome, which is where they stay in life.
        const angle = seededUnit(seed, 100 + i) * Math.PI * 2;
        const distance = r * 0.86 * seededUnit(seed, 130 + i) ** 0.7;
        ellipsoid(
          seeds,
          Math.cos(angle) * distance,
          // Sunk a fraction so the seed beds into the crust rather than
          // perching on it.
          crownHeightAt(distance) - 0.0006,
          Math.sin(angle) * distance,
          0.0034,
          0.0014,
          0.0022,
          angle + seededUnit(seed, 160 + i) * 1.2,
          10,
          6,
        );
      }
      const seedColours = paint(seeds, (p) => mixRgb(hex("#f4e6c2"), hex("#d9bd84"), grain(p, 520, 61)));
      primitives.push(finish(seeds, "sesame", hexToLinear("#f5e4bb"), 0, 0.4, seedColours));
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
