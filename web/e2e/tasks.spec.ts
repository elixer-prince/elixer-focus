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

  // Scope to the tasks container to avoid counting articles from other page components
  const tasksContainer = page.locator(".tasks-container");
  const columns = tasksContainer.locator("article");
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

  // Drag the task from the urgent-important column to the uncategorised column
  const urgentArticle = page.locator("article").filter({
    has: page.getByText("Urgent and Important"),
  });
  const uncategorisedArticle = page.locator("article").filter({
    has: page.getByText("Uncategorised"),
  });
  const taskElement = urgentArticle.locator("li.task").filter({
    hasText: "Draggable task",
  });
  const dragHandle = taskElement.locator('[aria-label="Drag to reorder"]');
  const dropTarget = uncategorisedArticle.locator("ul").first();

  const handleBox = (await dragHandle.boundingBox())!;
  const targetBox = (await dropTarget.boundingBox())!;
  await page.mouse.move(
    handleBox.x + handleBox.width / 2,
    handleBox.y + handleBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    {
      steps: 12,
    },
  );
  await page.mouse.up();

  // Verify the task is no longer in the source column and is present in the destination
  await expect(urgentArticle.getByText("Draggable task")).not.toBeVisible();
  await expect(
    uncategorisedArticle.getByText("Draggable task").first(),
  ).toBeVisible();
});

test("task page header is visible", async ({ page }) => {
  await page.goto("/tasks");

  // The task page should render the header with the "Your Tasks" title
  await expect(page.getByRole("heading", { name: "Your Tasks" })).toBeVisible();
});

test("task creation stays disabled during a pointer drag and resumes after cancel", async ({
  page,
}) => {
  await page.goto("/tasks");
  const header = page.getByRole("textbox", {
    name: "Uncategorised task input",
  });
  const create = page.getByRole("button", { name: "Create task" });
  await header.fill("First task");
  await header.press("Enter");
  await header.fill("Second task");
  await create.click();
  await header.fill("Header draft");

  const urgentColumn = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Urgent and Important Tasks" }),
  });
  await urgentColumn.getByRole("button", { name: "Add task" }).click();
  const columnInput = urgentColumn.getByRole("textbox");
  await columnInput.fill("Column draft");

  const tasks = page.locator("li.task:not([aria-hidden=true])");
  const source = tasks.filter({ hasText: "Second task" });
  const target = tasks.filter({ hasText: "First task" });
  const sourceHandle = source.locator('[aria-label="Drag to reorder"]');
  const start = (await sourceHandle.boundingBox())!;
  const end = (await target.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, {
    steps: 12,
  });

  await expect(source).toHaveAttribute("data-dragging", "true");
  await expect(tasks.first()).toContainText("First task");
  await expect(header).toBeDisabled();
  await expect(create).toBeDisabled();
  await expect(columnInput).toBeDisabled();
  await expect(tasks).toHaveCount(2);

  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect(tasks.first()).toContainText("Second task");
  await expect(header).toBeEnabled();
  await expect(create).toBeEnabled();
  await expect(columnInput).toBeEnabled();
  await expect(header).toHaveValue("Header draft");
  await expect(columnInput).toHaveValue("Column draft");
  await create.click();
  await columnInput.press("Enter");
  await expect(tasks).toHaveCount(4);
});

for (const key of ["Space", "Enter"]) {
  test(`can reorder tasks with ${key} and the arrow keys`, async ({ page }) => {
    await page.goto("/tasks");
    const header = page.getByRole("textbox", {
      name: "Uncategorised task input",
    });
    await header.fill("First task");
    await header.press("Enter");
    await header.fill("Second task");
    await header.press("Enter");

    const tasks = page.locator("li.task:not([aria-hidden=true])");
    const source = tasks.filter({ hasText: "Second task" });
    await header.press("Tab");
    await page.keyboard.press("Tab");
    await expect(source).toBeFocused();
    await page.keyboard.press(key);
    await expect(source).toHaveAttribute("data-dragging", "true");
    await page.keyboard.press("Shift+ArrowDown");
    await expect(tasks.first()).toContainText("First task");
    await page.keyboard.press(key);

    await expect(source).toHaveAttribute("data-dragging", "false");
    await expect(tasks.last()).toContainText("Second task");
    await expect(header).toBeEnabled();
  });
}
