import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("profile-storage");
  });
});

test("AC-1, AC-6, AC-7: edits profile details and persists them after reload", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "Focus User" })).toBeVisible();
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Display name").fill("Alex");
  await page.getByLabel("Bio").fill("Building better focus habits.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Alex" })).toBeVisible();
  await expect(page.getByText("Building better focus habits.")).toBeVisible();

  await page.reload();

  await expect(page.getByRole("heading", { name: "Alex" })).toBeVisible();
  await expect(page.getByText("Building better focus habits.")).toBeVisible();
});

test("AC-6: cancelling an edit leaves the saved profile unchanged", async ({
  page,
}) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByLabel("Display name").fill("Unsaved name");
  await page.getByLabel("Bio").fill("Unsaved bio.");
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByRole("heading", { name: "Focus User" })).toBeVisible();
  await expect(page.getByText("Unsaved bio.")).toBeHidden();
});
