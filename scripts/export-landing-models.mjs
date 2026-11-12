/**
 * Writes the 3D models the home page shows, from the same generator the app
 * uses for a dish, so the landing page never shows a nicer model than the
 * product actually makes.
 *
 *   node scripts/export-landing-models.mjs
 *
 * Out:
 *   public/home/assets/smash-burger.glb       the finished, coloured dish
 *   public/home/assets/smash-burger-clay.glb  the same mesh before colour,
 *                                             for the "shape, then colour" step
 *   public/home/assets/plate.glb              the empty plate, for the hero
 *
 * Re-run after changing lib/ar/geometry.ts or the seed dish below.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import createJiti from "jiti";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const jiti = createJiti(import.meta.url, { alias: { "@": root }, interopDefault: true });
const { buildDishGeometry } = jiti(path.join(root, "lib/ar/geometry.ts"));
const { encodeGlb } = jiti(path.join(root, "lib/ar/glb.ts"));

// The seed's Smash Burger (lib/db/seed.ts), so the id seeds the same wobble.
const dish = {
  id: "dish-smash-burger",
  name: "Smash Burger",
  flavour: { savoury: 92, sweet: 48, tang: 40, heat: 10 },
  dietTags: [],
  calories: 680,
};

const out = path.join(root, "public/home/assets");
const geometry = buildDishGeometry(dish);
const glb = encodeGlb(geometry, dish.name);
writeFileSync(path.join(out, "smash-burger.glb"), glb);

// Clay: identical mesh, one matte warm grey, no vertex colour.
const clay = {
  ...geometry,
  primitives: geometry.primitives.map(({ colors, ...p }) => ({
    ...p,
    baseColor: p.name === "plate" ? p.baseColor : [0.38, 0.4, 0.38, 1],
    roughness: 0.85,
  })),
};
writeFileSync(path.join(out, "smash-burger-clay.glb"), encodeGlb(clay, dish.name));

// The plate on its own: the hero shows it empty on the table, with the dish
// seen only through the phone (which hides the dish's own plate and uses this
// one). A 260mm dinner plate rather than the burger's 190mm one, so the
// plate's rim still shows either side of the phone with the whole burger
// inside the screen. Widened in x and z only; normals corrected to match.
const WIDEN = 0.13 / 0.095;
const widen = (p) => {
  const positions = Float32Array.from(p.positions);
  const normals = Float32Array.from(p.normals);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] *= WIDEN;
    positions[i + 2] *= WIDEN;
    const nx = normals[i] / WIDEN, ny = normals[i + 1], nz = normals[i + 2] / WIDEN;
    const len = Math.hypot(nx, ny, nz) || 1;
    normals[i] = nx / len; normals[i + 1] = ny / len; normals[i + 2] = nz / len;
  }
  return { ...p, positions, normals };
};
const plateOnly = { ...geometry, primitives: geometry.primitives.filter((p) => p.name === "plate").map(widen) };
plateOnly.vertexCount = plateOnly.primitives.reduce((n, p) => n + p.positions.length / 3, 0);
writeFileSync(path.join(out, "plate.glb"), encodeGlb(plateOnly, "Plate"));

console.log(
  `smash-burger.glb ${(glb.length / 1024).toFixed(0)} KB, ${geometry.vertexCount} vertices, ` +
    `${geometry.primitives.reduce((n, p) => n + p.indices.length / 3, 0)} triangles`,
);
