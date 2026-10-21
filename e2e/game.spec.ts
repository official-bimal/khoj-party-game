import { test, expect, type Page } from "@playwright/test";
async function start(page: Page, players = 3, imposters = 1) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Game suru gara", exact: true })
    .waitFor();
  for (let i = 3; i < players; i++)
    await page.getByRole("button", { name: "Add player", exact: true }).click();
  for (let i = 1; i < imposters; i++)
    await page.getByRole("button", { name: "More imposters" }).click();
  await page
    .getByRole("button", { name: "Game suru gara", exact: true })
    .click();
  await expect(
    page.getByText("For your eyes only.", { exact: true }),
  ).toBeVisible();
}
async function revealAll(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await expect(
      page.getByText("For your eyes only.", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Mero card hera", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Lukau ra phone deu", exact: true })
      .click();
  }
  await expect(page.getByRole("timer")).toBeVisible();
}
async function finish(page: Page, n: number) {
  await page
    .getByRole("button", { name: "Vote garne bela", exact: true })
    .click();
  for (let i = 0; i < n; i++)
    await page
      .getByRole("button", { name: "Vote nagarne", exact: true })
      .click();
  await expect(page.getByText("Ullu banayo!", { exact: false })).toBeVisible();
}
for (const [n, k] of [
  [3, 1],
  [6, 1],
  [5, 2],
])
  test(`${n} players and ${k} imposters complete voting and rematch`, async ({
    page,
  }) => {
    await start(page, n, k);
    await revealAll(page, n);
    await finish(page, n);
    await page
      .getByRole("button", { name: "Feri ek round?", exact: true })
      .click();
    await expect(page.getByText(`PRIVATE CARD · 1 / ${n}`)).toBeVisible();
  });
test("language switching, custom game and cancellation", async ({ page }) => {
  await page.goto("/");
  await page
    .getByLabel("Interface language", { exact: true })
    .selectOption("en");
  await expect(
    page.getByRole("button", { name: "Start game", exact: true }),
  ).toBeVisible();
  await page.goto("/custom");
  await page.getByLabel("Word / Roman Nepali").fill("Inside joke");
  await page.getByRole("button", { name: "Add word", exact: true }).click();
  await expect(
    page.getByText("1 word added. Saved on this device."),
  ).toBeVisible();
  await page.goto("/");
  await page
    .getByRole("button", { name: "All categories", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Your custom words", exact: false })
    .click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("button", { name: "Start game", exact: true }).click();
  await page.getByRole("button", { name: "Cancel game", exact: true }).click();
  await page.getByRole("button", { name: "Keep playing" }).click();
  await expect(
    page.getByText("For your eyes only.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reveal my card", exact: true })
    .click();
  await expect(page.locator(".secret-card")).toBeVisible();
  await page.getByRole("button", { name: "Cancel game", exact: true }).click();
  await page.getByRole("button", { name: "Leave game", exact: true }).click();
  await expect(page).toHaveURL("/");
});
test("360px mobile fits and has no hidden-word DOM leak", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await start(page);
  await expect(page.locator(".secret-card h2")).toHaveText(
    "For your eyes only.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/mobile-game.png",
    fullPage: true,
  });
});
test("offline shell launches and completes a three-player game", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Game suru gara", exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText("You’re offline.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Game suru gara", exact: true })
    .click();
  await revealAll(page, 3);
  await finish(page, 3);
  await context.setOffline(false);
});
test("homepage desktop screenshot", async ({ page }) => {
  await page.goto("/");
  const credit = page.getByRole("link", {
    name: "Designed and developed by Bimal Bhandari",
    exact: true,
  });
  await expect(credit).toHaveAttribute(
    "href",
    "https://www.instagram.com/bimalbhandari_/",
  );
  await expect(credit).toHaveAttribute("target", "_blank");
  await page.screenshot({
    path: "test-results/home-desktop.png",
    fullPage: true,
  });
});
test("all public screens fit 360px and Devanagari controls switch instantly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of [
    "/",
    "/online",
    "/custom",
    "/library",
    "/settings",
    "/rules",
    "/admin",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("link", {
        name: "Designed and developed by Bimal Bhandari",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBe(true);
    if (route === "/")
      await page.screenshot({
        path: "test-results/home-mobile.png",
        fullPage: true,
      });
  }
  await page.goto("/");
  await page
    .getByLabel("Interface language", { exact: true })
    .selectOption("ne");
  await expect(
    page.getByRole("button", { name: "खेल सुरु गर", exact: true }),
  ).toBeVisible();
  await page.goto("/settings");
  await page.getByLabel("Word language", { exact: true }).selectOption("ne");
  await page.goto("/");
  await page.getByRole("button", { name: "खेल सुरु गर", exact: true }).click();
  await page
    .getByRole("button", { name: "मेरो कार्ड हेर", exact: true })
    .click();
  await expect(page.locator(".secret-card")).toBeVisible();
});
test("Undercover and Chaos play full rounds with their own rules", async ({
  page,
}) => {
  for (const mode of ["Undercover", "Nepali Chaos"]) {
    await page.goto("/");
    await page.getByRole("tab", { name: mode, exact: true }).click();
    await page
      .getByRole("button", { name: "Game suru gara", exact: true })
      .click();
    await revealAll(page, 3);
    await finish(page, 3);
    await page
      .getByRole("button", { name: "Ghar farkau", exact: true })
      .click();
  }
});
