import { getAuth } from "@/lib/auth/session";
import { backend } from "@/lib/db";
import { readSupabaseSettings, supabase } from "@/lib/db/remote/client";

/**
 * Is the database actually set up?
 *
 * The Supabase backend is a lot of SQL that cannot be proven correct by reading
 * it. This checks the real thing:
 *
 *   /api/db-check            reads only — every table, the scan function, the
 *                            photo bucket
 *   /api/db-check?write=1    also writes one throwaway row and deletes it,
 *                            which is the only way to know inserts work
 *
 * Signed-in owners only: it names the schema, and the write pass touches data.
 */

const TABLES = [
  "restaurants",
  "users",
  "sessions",
  "categories",
  "dishes",
  "table_codes",
  "events",
  "orders",
  "reviews",
  "leads",
  "outbox",
];

interface Check {
  name: string;
  ok: boolean;
  detail?: string;
}

export async function GET(request: Request) {
  const auth = await getAuth();
  if (!auth) {
    return Response.json({ error: "Sign in first." }, { status: 401 });
  }

  const checks: Check[] = [];
  const settings = readSupabaseSettings();

  checks.push({
    name: "backend in use",
    ok: true,
    detail: backend,
  });

  if (!settings.ok) {
    checks.push({
      name: "Supabase configured",
      ok: false,
      detail: `missing ${settings.missing.join(", ")}`,
    });
    return Response.json(
      {
        ok: false,
        backend,
        summary:
          "Supabase is not configured, so these screens are running off the local file store. That works on this machine and will not survive a deployment.",
        checks,
      },
      { status: 200 },
    );
  }

  checks.push({ name: "Supabase configured", ok: true });

  // ------------------------------------------------------------- tables ---
  for (const table of TABLES) {
    const { error } = await supabase()
      .from(table)
      .select("*", { count: "exact", head: true });
    checks.push({
      name: `table ${table}`,
      ok: !error,
      detail: error?.message,
    });
  }

  // --------------------------------------------------------- scan counter ---
  {
    // A nil uuid matches nothing, so this proves the function exists without
    // changing a single row.
    const { error } = await supabase().rpc("bump_scan", {
      code_id: "00000000-0000-0000-0000-000000000000",
    });
    checks.push({
      name: "function bump_scan",
      ok: !error,
      detail: error?.message,
    });
  }

  // -------------------------------------------------------- photo bucket ---
  {
    const { data, error } = await supabase().storage.listBuckets();
    const found = (data ?? []).some((b) => b.name === "dish-photos");
    checks.push({
      name: "bucket dish-photos",
      ok: !error && found,
      detail: error?.message ?? (found ? undefined : "not found"),
    });
  }

  // ------------------------------------------------------- round trip ---
  const url = new URL(request.url);
  if (url.searchParams.get("write") === "1") {
    const slug = `db-check-${Date.now()}`;
    let createdId: string | null = null;

    try {
      const { data, error } = await supabase()
        .from("restaurants")
        .insert({ slug, name: "db-check", published: false })
        .select()
        .single();

      if (error) {
        checks.push({ name: "insert a row", ok: false, detail: error.message });
      } else {
        createdId = data.id as string;
        checks.push({ name: "insert a row", ok: true });

        const { error: readError } = await supabase()
          .from("restaurants")
          .select("*")
          .eq("id", createdId)
          .single();
        checks.push({
          name: "read it back",
          ok: !readError,
          detail: readError?.message,
        });

        const { error: updateError } = await supabase()
          .from("restaurants")
          .update({ tagline: "ok" })
          .eq("id", createdId);
        checks.push({
          name: "update it",
          ok: !updateError,
          detail: updateError?.message,
        });
      }
    } finally {
      // Always tidy up, even if a check above threw.
      if (createdId) {
        const { error } = await supabase()
          .from("restaurants")
          .delete()
          .eq("id", createdId);
        checks.push({
          name: "delete it again",
          ok: !error,
          detail: error?.message,
        });
      }
    }
  }

  const ok = checks.every((c) => c.ok);

  return Response.json({
    ok,
    backend,
    summary: ok
      ? url.searchParams.get("write") === "1"
        ? "Everything is in place and a row went in and out cleanly."
        : "Everything is in place. Add ?write=1 to also prove a write works."
      : "Something is missing — see the failed checks below. Most likely the migration in supabase/migrations has not been run yet.",
    checks,
  });
}
