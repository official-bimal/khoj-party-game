import { test, expect } from "@playwright/test";
test("three browsers create, reconnect, protect secrets, vote and rematch", async ({
  browser,
}) => {
  const contexts = await Promise.all([1, 2, 3].map(() => browser.newContext()));
  try {
    const pages = await Promise.all(contexts.map((c) => c.newPage()));
    const [host, b, c] = pages;
    await host.goto("/online");
    await host.getByLabel("Your nickname").fill("Host");
    await host.getByRole("button", { name: "Create private room" }).click();
    await expect(host.locator(".room-header strong")).toBeVisible();
    const code = (await host.locator(".room-header strong").textContent())!;
    for (const [page, name] of [
      [b, "Bina"],
      [c, "Chandra"],
    ] as const) {
      await page.goto(`/online?room=${code}`);
      await page.getByLabel("Your nickname").fill(name);
      await page
        .getByRole("button", { name: "Join room", exact: true })
        .click();
      await expect(page.locator(".room-header strong")).toHaveText(code);
    }
    for (const page of pages)
      await page
        .getByRole("button", { name: "I’m ready", exact: false })
        .click();
    await host
      .getByRole("button", { name: "Start round", exact: false })
      .click();
    const states = await Promise.all(
      contexts.map((ctx) =>
        ctx.request.get(`/api/rooms/${code}`).then((r) => r.json()),
      ),
    );
    for (const state of states) {
      expect(state.round.private).toBeTruthy();
      expect(state.round.result).toBeNull();
      expect(state.round.roles).toBeUndefined();
      expect(
        state.players.every(
          (p: Record<string, unknown>) => p.tokenHash === undefined,
        ),
      ).toBe(true);
    }
    const stranger = await browser.newContext();
    const leak = await stranger.request.get(`/api/rooms/${code}`);
    expect(leak.status()).toBe(400);
    await stranger.close();
    for (const page of pages) {
      await page
        .getByRole("button", { name: "Reveal my card", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Hide my card & get ready", exact: true })
        .click();
    }
    await expect(
      host.getByRole("button", { name: "Start voting", exact: false }),
    ).toBeVisible();
    await contexts[1].setOffline(true);
    await expect(b.getByText("Connection lost.", { exact: false })).toBeVisible(
      { timeout: 10000 },
    );
    await contexts[1].setOffline(false);
    await b.reload();
    await expect(
      b.getByText("Aba shanka suru!", { exact: true }),
    ).toBeVisible();
    await host
      .getByRole("button", { name: "Start voting", exact: false })
      .click();
    for (const page of pages)
      await page.getByRole("button", { name: "Abstain", exact: true }).click();
    await expect(host.getByText("Ullu banayo!", { exact: true })).toBeVisible();
    for (const page of pages)
      await page
        .getByRole("button", { name: "I’m ready", exact: false })
        .click();
    await host
      .getByRole("button", { name: "Start round", exact: false })
      .click();
    await expect(host.getByText("ROUND 2 · REVEALS")).toBeVisible();
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});
test("admin rejects unauthenticated requests and protects content", async ({
  request,
}) => {
  expect((await request.get("/api/admin")).status()).toBe(401);
  expect(
    (
      await request.post("/api/admin", {
        data: { action: "approve", id: "c1-1" },
      })
    ).status(),
  ).toBe(401);
});
test("authorized editorial import, duplicate rejection, review and publication", async ({
  request,
}) => {
  const headers = { Authorization: "Bearer local-test-token-only" };
  const id = `review-${Date.now()}`,
    word = { id, canonical: id, ne: "परीक्षण", categoryIds: ["c1"] };
  const added = await request.post("/api/admin", {
    headers,
    data: { action: "import", words: [word] },
  });
  expect(added.ok()).toBe(true);
  expect(
    (
      await request.post("/api/admin", {
        headers,
        data: { action: "import", words: [word] },
      })
    ).status(),
  ).toBe(400);
  const approval = await request.post("/api/admin", {
    headers,
    data: {
      action: "approve",
      id,
      reviewer: "Automated test (not editorial review)",
    },
  });
  expect(approval.ok()).toBe(true);
  expect(
    (
      await request.post("/api/admin", { headers, data: { action: "publish" } })
    ).ok(),
  ).toBe(true);
  const published = await request.get("/api/packs").then((r) => r.json());
  expect(published.words.some((w: { id: string }) => w.id === id)).toBe(true);
  await request.post("/api/admin", { headers, data: { action: "delete", id } });
  await request.post("/api/admin", { headers, data: { action: "publish" } });
});
