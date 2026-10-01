import { getAuth } from "@/lib/auth/session";
import { storePhoto } from "@/lib/storage/photos";

/**
 * Step 1 of the home page: the owner's photo of a dish.
 *
 * Where the file ends up is `lib/storage/photos.ts`'s problem — a folder on a
 * machine with a disk, Supabase Storage on a deployment.
 */

const MAX_BYTES = 8 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return Response.json({ error: "Please sign in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "That upload could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No photo was sent." }, { status: 400 });
  }

  const extension = ALLOWED[file.type];
  if (!extension) {
    return Response.json({ error: "Use a JPEG, PNG or WebP photo." }, { status: 415 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      {
        error: `That photo is ${(file.size / 1048576).toFixed(1)}MB. The limit is 8MB — most phone photos are well under it.`,
      },
      { status: 413 },
    );
  }

  try {
    const stored = await storePhoto(file, {
      restaurantId: auth.restaurant.id,
      extension,
    });
    return Response.json(stored);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The upload failed.";
    console.error("[dish360] photo upload failed", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
