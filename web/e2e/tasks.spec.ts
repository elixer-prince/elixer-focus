import { test, expect } from "@playwright/test";

// Clear persisted tasks storage before each test to ensure isolation
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("tasks-storage");
  });
});

test("tasks page renders all five columns", async ({ page }) => {
  await page.goto("/tasks");

  const columns = page.getByRole("article");
  await expect(columns).toHaveCount(5);

  await expect(page.getByText("Uncategorised")).toBeVisible();
  await expect(page.getByText("Urgent and Important")).toBeVisible();
  await expect(page.getByText("Not Urgent but Important")).toBeVisible();
  await expect(page.getByText("Urgent but Not Important")).toBeVisible();
  await expect(page.getByText("Not Urgent nor Important")).toBeVisible();
});

test("can add a task and see it in a column", async ({ page }) => {
  await page.goto("/tasks");

  const urgentColumn = page.getByText("Urgent and Important").first();
  const addButton = urgentColumn
    .locator("..")
    .locator("button")
    .filter({ hasText: /add task/i });
  await addButton.click();

  const input = page.getByPlaceholder("Finish assignment due in an hour...");
  await expect(input).toBeVisible();
  await input.fill("Test task for drag and drop");
  await input.press("Enter");

  await expect(page.getByText("Test task for drag and drop")).toBeVisible();
});

test("can add multiple tasks to a column", async ({ page }) => {
  await page.goto("/tasks");

  const urgentColumn = page.getByText("Urgent and Important").first();
  const addButton = urgentColumn
    .locator("..")
    .locator("button")
    .filter({ hasText: /add task/i });

  // Add first task
  await addButton.click();
  const input1 = page.getByPlaceholder("Finish assignment due in an hour...");
  await expect(input1).toBeVisible();
  await input1.fill("First task");
  await input1.press("Enter");

  // Add second task
  await addButton.click();
  const input2 = page.getByPlaceholder("Finish assignment due in an hour...");
  await expect(input2).toBeVisible();
  await input2.fill("Second task");
  await input2.press("Enter");

  await expect(page.getByText("First task")).toBeVisible();
  await expect(page.getByText("Second task")).toBeVisible();
});

test("tasks are draggable (drag handles present)", async ({ page }) => {
  await page.goto("/tasks");

  const urgentColumn = page.getByText("Urgent and Important").first();
  const addButton = urgentColumn
    .locator("..")
    .locator("button")
    .filter({ hasText: /add task/i });
  await addButton.click();

  const input = page.getByPlaceholder("Finish assignment due in an hour...");
  await expect(input).toBeVisible();
  await input.fill("Draggable task");
  await input.press("Enter");

  await expect(page.getByText("Draggable task")).toBeVisible();

  // Verify the task element has cursor-grab class (indicating it is draggable)
  const taskElement = page.locator("li.task").first();
  await expect(taskElement).toHaveClass(/cursor-grab/);
});

test("task page header is visible", async ({ page }) => {
  await page.goto("/tasks");

  // The task page should render the header component
  await expect(page.getByRole("heading")).toBeVisible();
});
