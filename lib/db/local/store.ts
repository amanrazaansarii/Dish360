import { promises as fs } from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";
import { refuseLocalStoreInProduction } from "../guard";
import { buildSeed } from "../seed";

/**
 * File-backed JSON store.
 *
 * Deliberately the only module that touches the filesystem, so the whole app
 * talks to `read()` / `write()` and nothing else. Swapping in Supabase means
 * reimplementing `lib/db/index.ts` against the same repository signatures —
 * no page or component imports this file directly.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "dish360.json");

const SCHEMA_VERSION = 1;

interface StoreState {
  /** Cached so a request doesn't re-read the file once per query. */
  cache: Database | null;
  /**
   * In-flight load. A page issuing several queries in `Promise.all` would
   * otherwise start one load per query and race to seed the same file.
   */
  loading: Promise<Database> | null;
  /** Serialises writes; concurrent Server Actions would otherwise clobber. */
  queue: Promise<unknown>;
  /** Makes each temp filename unique, so parallel writes cannot collide. */
  counter: number;
}

/**
 * The state lives on `globalThis`, not in module scope.
 *
 * Pages, Server Actions and Route Handlers can each be bundled into their own
 * module graph, which means module-level state is *duplicated* rather than
 * shared: a write from a Server Action would leave the Route Handler's copy of
 * the cache stale, and the handler would keep serving data from before the
 * write. Anchoring to the global keeps one instance per process.
 */
const GLOBAL_KEY = Symbol.for("dish360.store");

type GlobalWithStore = typeof globalThis & { [GLOBAL_KEY]?: StoreState };

function state(): StoreState {
  const holder = globalThis as GlobalWithStore;
  if (!holder[GLOBAL_KEY]) {
    holder[GLOBAL_KEY] = {
      cache: null,
      loading: null,
      queue: Promise.resolve(),
      counter: 0,
    };
  }
  return holder[GLOBAL_KEY];
}

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Database;
    if (parsed.version !== SCHEMA_VERSION) {
      // Forward-only: unknown versions are reseeded rather than guessed at.
      const seeded = buildSeed();
      await persist(seeded);
      return seeded;
    }
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    const seeded = buildSeed();
    await persist(seeded);
    return seeded;
  }
}

async function persist(db: Database): Promise<void> {
  const store = state();
  await fs.mkdir(DATA_DIR, { recursive: true });
  store.counter += 1;
  const tmp = `${DATA_FILE}.${process.pid}.${store.counter}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  // Atomic-ish swap so a crash mid-write can't truncate the store.
  await fs.rename(tmp, DATA_FILE);
}

export async function read(): Promise<Database> {
  refuseLocalStoreInProduction();

  const store = state();
  if (store.cache) return store.cache;

  if (!store.loading) {
    store.loading = loadFromDisk()
      .then((db) => {
        store.cache = db;
        return db;
      })
      .finally(() => {
        store.loading = null;
      });
  }
  return store.loading;
}

/**
 * Applies `mutate` to the database and persists the result.
 * Runs inside a queue so overlapping mutations serialise.
 */
export async function write<T>(mutate: (db: Database) => T | Promise<T>): Promise<T> {
  const store = state();

  const run = store.queue.then(async () => {
    const db = await read();
    const result = await mutate(db);
    await persist(db);
    store.cache = db;
    return result;
  });

  // Keep the chain alive even if this mutation throws.
  store.queue = run.catch(() => undefined);
  return run;
}

/** Drops the cache so the next read hits disk. */
export function invalidate(): void {
  const store = state();
  store.cache = null;
  store.loading = null;
}

export async function resetToSeed(): Promise<Database> {
  refuseLocalStoreInProduction();

  const seeded = buildSeed();
  await persist(seeded);
  state().cache = seeded;
  return seeded;
}
