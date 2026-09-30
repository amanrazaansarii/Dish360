import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { getAuth } from "@/lib/auth/session";

/**
 * Step 1 of the home page: the owner's photo of a dish.
 *
 * Writes into `public/uploads/`, which is right for one server or a container
 * with a volume. On a host with no persistent disk this is the one function to
 * point at object storage — everything else only ever sees the returned path.
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

  const bytes = Buffer.from(await file.arrayBuffer());

  // The name is generated. An uploaded filename is attacker-controlled and has
  // no business deciding where anything lands.
  const filename = `${auth.restaurant.id}-${randomUUID()}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), bytes);

  return Response.json({ url: `/uploads/${filename}`, bytes: file.size });
}
