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

console.log(
  `smash-burger.glb ${(glb.length / 1024).toFixed(0)} KB, ${geometry.vertexCount} vertices, ` +
    `${geometry.primitives.reduce((n, p) => n + p.indices.length / 3, 0)} triangles`,
);
