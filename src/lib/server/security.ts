import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
export const token = () => randomBytes(32).toString("hex");
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export function equal(a: string, b: string) {
  const x = Buffer.from(hash(a)),
    y = Buffer.from(hash(b));
  return timingSafeEqual(x, y);
}
const g = globalThis as unknown as {
  khojLimits?: Map<string, { count: number; until: number }>;
};
export function rateLimit(key: string, max = 60, window = 60000) {
  const map = (g.khojLimits ??= new Map());
  const now = Date.now();
  if (map.size > 10000)
    for (const [k, v] of map) if (v.until < now) map.delete(k);
  const v = map.get(key);
  if (!v || v.until < now) {
    map.set(key, { count: 1, until: now + window });
    return;
  }
  if (++v.count > max)
    throw new Error("Too many requests. Try again in a minute.");
}
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== (process.env.APP_ORIGIN || new URL(req.url).origin))
    throw new Error("Invalid request origin");
}
export async function body(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > 1000000)
    throw new Error("Request too large");
  const raw = await req.text();
  if (raw.length > 1000000) throw new Error("Request too large");
  return JSON.parse(raw);
}
