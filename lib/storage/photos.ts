import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { supabase, supabaseConfigured } from "@/lib/db/remote/client";
import { refuseLocalPhotosInProduction } from "@/lib/db/guard";
import { backend } from "@/lib/db";

/**
 * Where a dish photograph goes.
 *
 * Same two-sided arrangement as the data: a folder under public/ on a machine
 * with a disk, Supabase Storage on a deployment. Callers get a URL back and do
 * not care which happened.
 */

const BUCKET = "dish-photos";

export interface StoredPhoto {
  url: string;
  bytes: number;
}

export function photoStore(): "disk" | "supabase" {
  return backend === "supabase" && supabaseConfigured() ? "supabase" : "disk";
}

export async function storePhoto(
  file: File,
  options: { restaurantId: string; extension: string },
): Promise<StoredPhoto> {
  const bytes = Buffer.from(await file.arrayBuffer());

  // The name is generated. An uploaded filename is attacker-controlled and has
  // no business deciding where anything lands.
  const name = `${options.restaurantId}/${randomUUID()}.${options.extension}`;

  if (photoStore() === "supabase") {
    const { error } = await supabase()
      .storage.from(BUCKET)
      .upload(name, bytes, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) {
      throw new Error(`The photo could not be stored: ${error.message}`);
    }

    const { data } = supabase().storage.from(BUCKET).getPublicUrl(name);
    return { url: data.publicUrl, bytes: file.size };
  }

  // A deployment that got this far has no Supabase and no usable disk.
  refuseLocalPhotosInProduction();

  const flat = name.replace("/", "-");
  const directory = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, flat), bytes);

  return { url: `/uploads/${flat}`, bytes: file.size };
}
