/**
 * The one check that stops Dish360 going live on a disk that isn't there.
 *
 * Two things fall back to the local filesystem when Supabase is absent: the
 * JSON store under `.data/`, and dish photographs under `public/uploads/`. Both
 * are right on a laptop and wrong on a serverless host, where the filesystem is
 * read-only or thrown away between requests — the app would appear to work, and
 * then lose everything.
 *
 * The refusal fires when a request actually arrives, not when the module loads:
 *
 *   - `next build` runs with NODE_ENV=production. A build is not a deployment,
 *     and refusing there would mean nobody without Supabase keys could build
 *     the project at all.
 *   - a module-load throw surfaces as an opaque webpack frame. Throwing from
 *     the call that needed the disk gives a stack worth reading.
 */

/** True while `next build` is collecting page data, not serving anyone. */
function building(): boolean {
  const phase = process.env.NEXT_PHASE;
  return phase === "phase-production-build" || phase === "phase-export";
}

/**
 * Is writing to this machine's disk a mistake right now?
 *
 * `DATA_BACKEND=local` is the explicit opt-in for a VPS or container that does
 * have a real, persistent disk.
 */
export function localDiskIsUnsafe(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (process.env.DATA_BACKEND === "local") return false;
  return !building();
}

const SETUP = [
  "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, then run",
  "supabase/migrations/0001_dish360.sql against that project.",
];

export function refuseLocalStoreInProduction(): void {
  if (!localDiskIsUnsafe()) return;

  throw new Error(
    [
      "Dish360 has no database configured.",
      "",
      ...SETUP,
      "",
      "The local file store is for development only: a deployed app usually",
      "has no writable disk, and nothing written to it would survive the",
      "request. Set DATA_BACKEND=local to allow it on a host with a real disk.",
    ].join("\n"),
  );
}

export function refuseLocalPhotosInProduction(): void {
  if (!localDiskIsUnsafe()) return;

  throw new Error(
    [
      "Dish360 has nowhere to put photographs.",
      "",
      ...SETUP,
      "",
      "Without it, photos are written to public/uploads on this machine —",
      "which a deployed app cannot write to, and would not serve even if it",
      "could, because public/ is fixed at build time.",
    ].join("\n"),
  );
}
