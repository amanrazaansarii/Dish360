import { buildDishGeometry, inferForm, type DishGeometry } from "./geometry";
import { encodeGlb } from "./glb";
import { encodeUsdz } from "./usdz";
import type { Dish } from "@/lib/types";

/**
 * Step 2 of the landing page: "We turn each photo into 3D."
 *
 * Two providers sit behind one interface:
 *
 *  - `3daistudio` — turns the owner's actual photograph into a mesh. Needs a
 *    paid key, so it is off unless `MODEL_PROVIDER=3daistudio` and
 *    `THREE_D_AI_STUDIO_API_KEY` are both set.
 *  - `built-in` — builds a real, true-to-scale mesh from the dish record with
 *    no external call. This is the default, so the whole flow works today.
 *
 * Both return the same shape. Whichever runs, the owner still has to approve
 * the result before a guest sees it.
 */

export type ProviderId = "built-in" | "3daistudio";

export interface ConversionResult {
  provider: ProviderId;
  vertices: number;
  /** metres — the widest measurement across the plate */
  footprint: number;
  glb: Buffer;
  usdz: Buffer;
}

export function activeProvider(): ProviderId {
  if (
    process.env.MODEL_PROVIDER === "3daistudio" &&
    process.env.THREE_D_AI_STUDIO_API_KEY
  ) {
    return "3daistudio";
  }
  return "built-in";
}

/** Plain-language status for the dashboard. */
export function providerStatus(): {
  id: ProviderId;
  label: string;
  connected: boolean;
  note: string;
} {
  if (activeProvider() === "3daistudio") {
    return {
      id: "3daistudio",
      label: "3D AI Studio",
      connected: true,
      note: "Your photos are sent to 3D AI Studio, which builds the model from the photo itself.",
    };
  }
  return {
    id: "built-in",
    label: "Built-in",
    connected: false,
    note: "Models are built here, from what you type about the dish. To build them from your photographs instead, add a 3D AI Studio key.",
  };
}

export function geometryFor(dish: Dish): DishGeometry {
  return buildDishGeometry({
    id: dish.id,
    name: dish.name,
    flavour: dish.flavour,
    dietTags: dish.dietTags,
    calories: dish.calories,
    form: inferForm(dish.name),
  });
}

function encode(
  dish: Dish,
  geometry: DishGeometry,
  provider: ProviderId,
): ConversionResult {
  const { min, max } = geometry.bounds;
  return {
    provider,
    vertices: geometry.vertexCount,
    footprint: Math.max(max[0] - min[0], max[2] - min[2]),
    glb: encodeGlb(geometry, dish.name),
    usdz: encodeUsdz(geometry, dish.name),
  };
}

/**
 * Calls 3D AI Studio. Left thin on purpose: the exact request and response
 * shape depends on the account's plan, so it is verified against the live API
 * the first time a key is present rather than guessed at now.
 */
async function convertViaStudio(
  dish: Dish,
  imageUrl: string,
): Promise<ConversionResult> {
  const key = process.env.THREE_D_AI_STUDIO_API_KEY;
  const endpoint =
    process.env.THREE_D_AI_STUDIO_ENDPOINT ??
    "https://api.3daistudio.com/v1/image-to-3d";
  if (!key) throw new Error("THREE_D_AI_STUDIO_API_KEY is not set");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      output_formats: ["glb", "usdz"],
      target_polycount: 20000,
      name: dish.name,
    }),
  });

  if (!response.ok) {
    throw new Error(`3D AI Studio replied ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    glb_url?: string;
    usdz_url?: string;
    vertices?: number;
  };
  if (!payload.glb_url) throw new Error("3D AI Studio returned no model");

  const glbResponse = await fetch(payload.glb_url);
  if (!glbResponse.ok) throw new Error("Could not download the model");
  const glb = Buffer.from(await glbResponse.arrayBuffer());

  let usdz = glb;
  if (payload.usdz_url) {
    const usdzResponse = await fetch(payload.usdz_url);
    if (usdzResponse.ok) usdz = Buffer.from(await usdzResponse.arrayBuffer());
  }

  return {
    provider: "3daistudio",
    vertices: payload.vertices ?? 0,
    footprint: 0,
    glb,
    usdz,
  };
}

export async function convertDish(dish: Dish): Promise<ConversionResult> {
  if (activeProvider() === "3daistudio" && dish.imageUrl) {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const absolute = dish.imageUrl.startsWith("http")
      ? dish.imageUrl
      : `${base}${dish.imageUrl}`;
    try {
      return await convertViaStudio(dish, absolute);
    } catch (error) {
      // An outage upstream must not leave the owner with no model at all.
      console.warn(
        `[dish360] 3D AI Studio could not build ${dish.id}; using the built-in model instead.`,
        error,
      );
    }
  }

  return encode(dish, geometryFor(dish), "built-in");
}

/** Model bytes on demand, so nothing generated has to be stored. */
export function renderModel(dish: Dish, format: "glb" | "usdz"): Buffer {
  const geometry = geometryFor(dish);
  return format === "glb"
    ? encodeGlb(geometry, dish.name)
    : encodeUsdz(geometry, dish.name);
}
