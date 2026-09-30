import { test, expect } from "@playwright/test";

test("smoke: disclosure banner visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("note")).toContainText("Investigative lead only");
});
