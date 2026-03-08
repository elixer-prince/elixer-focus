import TaskPageHeader from "@/features/tasks/components/TaskPageHeader";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("TaskPageHeader", () => {
  it("should render an h1 element with the test 'Your Tasks'", () => {
    render(<TaskPageHeader />);

    const pageHeader = screen.getByRole("heading", {
      level: 1,
      name: /your tasks/i,
    });

    expect(pageHeader).toBeInTheDocument();
  });

  it("should render a task input element", () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox");

    expect(taskInput).toBeInTheDocument();
    expect(taskInput).toHaveClass("new-task-input");
  });

  it("should be able to type in the task input", async () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox");
    await userEvent.type(taskInput, "Test task");
    expect((taskInput as HTMLInputElement).value).toBe("Test task");
  });

  it("should have placeholder text", () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox");
    expect(taskInput).toHaveAttribute("placeholder", "A random task...");
  });

  it("should clear the task input when the create task button is clicked", async () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox");
    const createTaskButton = screen.getByRole("button", {
      name: /create task/i,
    });

    await userEvent.type(taskInput, "Test task");
    await userEvent.click(createTaskButton);

    expect((taskInput as HTMLInputElement).value).toBe("");
  });

  it("should clear the task input when the enter key is pressed", async () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox", {
      name: /uncategorised task input/i,
    });

    await userEvent.type(taskInput, "Test task");
    await userEvent.keyboard("{Enter}");

    expect((taskInput as HTMLInputElement).value).toBe("");
  });

  it("should prevent empty tasks from being created", async () => {
    render(<TaskPageHeader />);

    const taskInput = screen.getByRole("textbox");

    await userEvent.type(taskInput, "   ");
    await userEvent.keyboard("{Enter}");

    expect((taskInput as HTMLInputElement).value).toBe("");
  });
});
