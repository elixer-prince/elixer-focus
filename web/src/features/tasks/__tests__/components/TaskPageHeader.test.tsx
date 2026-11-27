import TaskPageHeader from "@/features/tasks/components/TaskPageHeader";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const renderTaskPageHeader = (searchQuery = "", onSearchChange = vi.fn()) =>
  render(
    <TaskPageHeader
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
    />,
  );

describe("TaskPageHeader", () => {
  it("should render an h1 element with the test 'Your Tasks'", () => {
    renderTaskPageHeader();

    const pageHeader = screen.getByRole("heading", {
      level: 1,
      name: /your tasks/i,
    });

    expect(pageHeader).toBeInTheDocument();
  });

  it("should render a task input element", () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });

    expect(taskInput).toBeInTheDocument();
    expect(taskInput).toHaveClass("new-task-input");
  });

  it("should be able to type in the task input", async () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });
    await userEvent.type(taskInput, "Test task");
    expect((taskInput as HTMLInputElement).value).toBe("Test task");
  });

  it("should have placeholder text", () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });
    expect(taskInput).toHaveAttribute("placeholder", "A random task...");
  });

  it("should clear the task input when the create task button is clicked", async () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });
    const createTaskButton = screen.getByRole("button", {
      name: /create task/i,
    });

    await userEvent.type(taskInput, "Test task");
    await userEvent.click(createTaskButton);

    expect((taskInput as HTMLInputElement).value).toBe("");
  });

  it("should clear the task input when the enter key is pressed", async () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });

    await userEvent.type(taskInput, "Test task");
    await userEvent.keyboard("{Enter}");

    expect((taskInput as HTMLInputElement).value).toBe("");
  });

  it("should prevent empty tasks from being created", async () => {
    renderTaskPageHeader();

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });

    await userEvent.type(taskInput, "   ");
    await userEvent.keyboard("{Enter}");

    expect((taskInput as HTMLInputElement).value).toBe("");
  });

  it("should report changes to the task search input", () => {
    const onSearchChange = vi.fn();
    renderTaskPageHeader("", onSearchChange);

    const searchInput = screen.getByRole("searchbox", {
      name: /search tasks/i,
    });
    fireEvent.change(searchInput, { target: { value: "focus" } });

    expect(onSearchChange).toHaveBeenCalledWith("focus");
  });
});
