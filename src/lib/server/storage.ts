import "server-only";
import { Pool } from "pg";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
const globals = globalThis as unknown as {
  khojPool?: Pool;
  khojQueue?: Promise<unknown>;
  khojRooms?: Map<string, { expires: number; document: unknown }>;
};
function pool() {
  return (globals.khojPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  }));
}
export async function transaction<T, R>(
  key: string,
  fn: (value: T | null) => Promise<{ value: T; result: R }>,
): Promise<R> {
  if (process.env.DATABASE_URL) {
    const db = await pool().connect();
    try {
      await db.query("BEGIN");
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
      const rows = await db.query(
        'SELECT state FROM "StateDocument" WHERE id=$1 FOR UPDATE',
        [key],
      );
      const { value, result } = await fn(rows.rows[0]?.state ?? null);
      await db.query(
        'INSERT INTO "StateDocument" (id,state) VALUES ($1,$2) ON CONFLICT (id) DO UPDATE SET state=$2, "updatedAt"=NOW()',
        [key, JSON.stringify(value)],
      );
      await db.query("COMMIT");
      return result;
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    } finally {
      db.release();
    }
  }
  if (process.env.ALLOW_EPHEMERAL_ROOMS === "true") {
    if (!key.startsWith("room-"))
      throw new Error(
        "Persistent content management requires a database. Local packs still work.",
      );
    const rooms = (globals.khojRooms ??= new Map());
    const run = async () => {
      const now = Date.now();
      for (const [id, item] of rooms) if (item.expires < now) rooms.delete(id);
      if (!rooms.has(key) && rooms.size >= 1000)
        throw new Error("Room capacity reached. Please try again later.");
      const old = rooms.get(key);
      const { value, result } = await fn(
        old ? (structuredClone(old.document) as T) : null,
      );
      const expires =
        Number((value as { expires?: number }).expires) || now + 7200000;
      rooms.set(key, { expires, document: structuredClone(value) });
      return result;
    };
    const result = (globals.khojQueue ?? Promise.resolve()).then(run, run);
    globals.khojQueue = result.catch(() => {});
    return result;
  }
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_FILE_STORAGE !== "true"
  )
    throw new Error("DATABASE_URL is required for online play in production");
  const run = async () => {
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${key.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
    let old: T | null = null;
    try {
      old = JSON.parse(await readFile(file, "utf8"));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
    const { value, result } = await fn(old);
    const tmp = `${file}.tmp`;
    await writeFile(tmp, JSON.stringify(value));
    await rename(tmp, file);
    return result;
  };
  const result = (globals.khojQueue ?? Promise.resolve()).then(run, run);
  globals.khojQueue = result.catch(() => {});
  return result;
}
