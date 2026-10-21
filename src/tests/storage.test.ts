import { afterEach, describe, it, expect, vi } from "vitest";
import { transaction } from "../lib/server/storage";
afterEach(() => vi.unstubAllEnvs());
describe("free-host temporary room storage", () => {
  it("serializes writes and rolls back failed actions", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ALLOW_EPHEMERAL_ROOMS", "true");
    const key = `room-${crypto.randomUUID()}`;
    await transaction<{ count: number }, number>(key, async () => ({
      value: { count: 0 },
      result: 0,
    }));
    await Promise.all(
      [1, 2, 3].map(() =>
        transaction<{ count: number }, number>(key, async (old) => ({
          value: { count: old!.count + 1 },
          result: 0,
        })),
      ),
    );
    await expect(
      transaction<{ count: number }, number>(key, async (old) => {
        old!.count = 100;
        throw new Error("reject");
      }),
    ).rejects.toThrow("reject");
    const count = await transaction<{ count: number }, number>(
      key,
      async (old) => ({ value: old!, result: old!.count }),
    );
    expect(count).toBe(3);
  });
  it("refuses temporary editorial writes", async () => {
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("ALLOW_EPHEMERAL_ROOMS", "true");
    await expect(
      transaction("content", async () => ({ value: {}, result: 0 })),
    ).rejects.toThrow("requires a database");
  });
});
