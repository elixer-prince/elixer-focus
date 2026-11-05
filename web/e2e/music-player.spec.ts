import { test, expect } from "@playwright/test";

test("play button starts playback on first click", async ({ page }) => {
  await page.goto("/");

  const playButton = page.getByRole("button", { name: /play music button/i });
  await expect(playButton).toBeVisible();

  await playButton.click();

  // After clicking play, the button should toggle to a pause button
  const pauseButton = page.getByRole("button", { name: /pause music button/i });
  await expect(pauseButton).toBeVisible();

  // The play button should no longer be visible
  await expect(playButton).toBeHidden();
});

test("pause button pauses playback", async ({ page }) => {
  await page.goto("/");

  const playButton = page.getByRole("button", { name: /play music button/i });
  await playButton.click();

  const pauseButton = page.getByRole("button", { name: /pause music button/i });
  await expect(pauseButton).toBeVisible();
  await pauseButton.click();

  await expect(playButton).toBeVisible();
});
