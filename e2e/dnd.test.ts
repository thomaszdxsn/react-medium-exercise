import { test, expect } from "@playwright/test";

test("test vite", async ({ page }) => {
  await page.goto("/");
  const title = page.locator("title");
  await expect(title).toHaveText("Vite App");
});

test("test dnd", async ({ page }) => {
  await page.goto("/");
  const appendBtn = page.locator("button[role='append-organization-button']");
  await appendBtn.click();
  await appendBtn.click();

  const aInput = page.locator("input[name='orgs.0.name']");
  await aInput.fill("a");
  const bInput = page.locator("input[name='orgs.1.name']");
  await bInput.fill("b");

  const dndHandle = page.locator("*[aria-roledescription='sortable']").nth(0);
  const box = await dndHandle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 200, { steps: 5 });
  await page.mouse.up();
  await expect(aInput).toHaveValue("b");
  await expect(bInput).toHaveValue("a");
});
