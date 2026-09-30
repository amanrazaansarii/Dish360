import { createHash } from "node:crypto";
import { getDish } from "@/lib/db";
import { renderModel } from "@/lib/ar/pipeline";
import { GEOMETRY_VERSION } from "@/lib/ar/geometry";
import { isLiveInAr } from "@/lib/dish";
import type { Dish } from "@/lib/types";

/**
 * Serves a dish's 3D model.
 *
 *   /api/model/<dishId>/model.glb    Android, and the viewer on a computer
 *   /api/model/<dishId>/model.usdz   iPhone and iPad
 *
 * Models are built on demand and never stored: the shape is worked out from the
 * dish record, so the bytes are the same every time and cache cleanly.
 */

const TYPES: Record<string, string> = {
  "model.glb": "model/gltf-binary",
  "model.usdz": "model/vnd.usdz+zip",
};

/**
 * Built from everything the shape depends on, so editing a dish or improving
 * the builder replaces the cached model — and nothing else does.
 */
function etagFor(dish: Dish, format: string): string {
  const signature = JSON.stringify({
    v: GEOMETRY_VERSION,
    format,
    id: dish.id,
    name: dish.name,
    calories: dish.calories,
    flavour: dish.flavour,
    dietTags: dish.dietTags,
    updatedAt: dish.model.updatedAt,
  });
  return `"${createHash("sha1").update(signature).digest("base64url")}"`;
}

export async function GET(
  request: Request,
  { params }: { params: { dishId: string; file: string } },
) {
  const contentType = TYPES[params.file];
  if (!contentType) {
    return Response.json(
      { error: "Ask for model.glb or model.usdz." },
      { status: 404 },
    );
  }

  const dish = await getDish(params.dishId);
  if (!dish) {
    return Response.json({ error: "No such dish." }, { status: 404 });
  }

  // The owner has to approve a model before a guest can load it.
  if (!isLiveInAr(dish)) {
    return Response.json(
      { error: "This dish is not available in 3D yet." },
      { status: 409 },
    );
  }

  const format = params.file === "model.glb" ? "glb" : "usdz";
  const etag = etagFor(dish, format);

  // Short cache so a guest on mobile data does not re-download it within one
  // sitting, but a change the kitchen makes still reaches the next table.
  const cacheControl = "public, max-age=300, must-revalidate";

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, "Cache-Control": cacheControl },
    });
  }

  const bytes = renderModel(dish, format);
  const filename = `${dish.name.replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}.${format}`;

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": cacheControl,
      ETag: etag,
    },
  });
}
