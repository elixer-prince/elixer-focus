import TaskList from "@/features/tasks/components/Column/TaskList";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";

// Mocks

const taskListMocks = vi.hoisted(() => ({
  toggleTaskCompletion: vi.fn(),
}));

vi.mock("@/features/tasks/stores/tasks-store", () => ({
  useAddTask: vi.fn(),
  useRemoveTask: vi.fn(),
  useToggleTaskCompletion: vi.fn(() => taskListMocks.toggleTaskCompletion),
  useUpdateTask: vi.fn(),
  useTasks: vi.fn(),
}));

// Teardown

afterEach(() => {
  vi.clearAllMocks();
});

//  Test Suite

describe("Column.TaskList", () => {
  it("should render when there are tasks", () => {
    (useTasks as Mock).mockReturnValue([
      {
        id: "ExStr123f51",
        title: "The a random Task!",
        category: "uncategorised",
        isCompleted: false,
      },
    ]);

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder="Placeholder task..."
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should render even when there are no tasks", () => {
    (useTasks as Mock).mockReturnValue([]);

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder="Placeholder task..."
      />,
    );

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should only render tasks when they belong to the column category", () => {
    (useTasks as Mock).mockReturnValue([
      {
        id: "ExStr123f51",
        title: "The first random Task!",
        category: "urgent-important",
        isCompleted: false,
      },
      {
        id: "ExStr123f52",
        title: "Another random Task!",
        category: "uncategorised",
        isCompleted: false,
      },
    ]);

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder="Placeholder task..."
      />,
    );

    expect(screen.getAllByRole("listitem").length).toBe(1);
  });

  it("AC-1: keeps completed tasks out of active columns", () => {
    (useTasks as Mock).mockReturnValue([
      {
        id: "active",
        title: "Active task",
        category: "uncategorised",
        isCompleted: false,
      },
      {
        id: "completed",
        title: "Completed task",
        category: "uncategorised",
        isCompleted: true,
      },
    ]);

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder=""
      />,
    );

    expect(screen.getByText("Active task")).toBeInTheDocument();
    expect(screen.queryByText("Completed task")).not.toBeInTheDocument();
  });

  it("AC-1 and AC-8: animates a task only after its completion write succeeds", async () => {
    const tasks = [
      {
        id: "task-1",
        title: "Finish the report",
        category: "uncategorised",
        isCompleted: false,
      },
    ];
    (useTasks as Mock).mockReturnValue(tasks);
    taskListMocks.toggleTaskCompletion.mockImplementation(
      async (_id: string, completed: boolean) => {
        tasks[0].isCompleted = completed;
        return { success: true };
      },
    );
    const onTaskExitStart = vi.fn();

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder=""
        onTaskExitStart={onTaskExitStart}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Complete Finish the report" }),
    );

    const task = screen.getByText("Finish the report").closest("li");
    await waitFor(() => expect(task).toHaveClass("translate-x-8", "opacity-0"));
    expect(onTaskExitStart).toHaveBeenCalledWith("task-1");
  });

  it("AC-9: keeps a task visible without exit motion when its completion write fails", async () => {
    (useTasks as Mock).mockReturnValue([
      {
        id: "task-2",
        title: "Keep this task",
        category: "uncategorised",
        isCompleted: false,
      },
    ]);
    taskListMocks.toggleTaskCompletion.mockResolvedValue({ success: false });
    const onTaskExitEnd = vi.fn();

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder=""
        onTaskExitEnd={onTaskExitEnd}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Complete Keep this task" }),
    );

    const task = screen.getByText("Keep this task").closest("li");
    await waitFor(() =>
      expect(onTaskExitEnd).toHaveBeenCalledWith("task-2", false),
    );
    expect(task).not.toHaveClass("translate-x-8", "opacity-0");
    expect(task).toBeInTheDocument();
  });

  it("AC-8: interrupts exit motion when a newer state reopens the task", async () => {
    const tasks = [
      {
        id: "task-3",
        title: "Reopen during exit",
        category: "uncategorised",
        isCompleted: false,
      },
    ];
    (useTasks as Mock).mockReturnValue(tasks);
    taskListMocks.toggleTaskCompletion.mockImplementation(
      async (_id: string, completed: boolean) => {
        tasks[0].isCompleted = completed;
        return { success: true };
      },
    );
    const onTaskExitEnd = vi.fn();
    const taskListProps = {
      columnCategory: "uncategorised" as const,
      inputShown: false,
      setInputShown: vi.fn(),
      placeholder: "",
      onTaskExitEnd,
    };
    const { rerender } = render(<TaskList {...taskListProps} />);

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Complete Reopen during exit" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Reopen during exit").closest("li")).toHaveClass(
        "opacity-0",
      ),
    );

    (useTasks as Mock).mockReturnValue([{ ...tasks[0], isCompleted: false }]);
    rerender(<TaskList {...taskListProps} />);

    await waitFor(() =>
      expect(onTaskExitEnd).toHaveBeenCalledWith("task-3", false),
    );
    expect(
      screen.getByText("Reopen during exit").closest("li"),
    ).not.toHaveClass("opacity-0");
  });

  it("should render ghost task when there are no tasks", () => {
    (useTasks as Mock).mockReturnValue([]); // mocks an empty tasks array

    render(
      <TaskList
        columnCategory="uncategorised"
        inputShown={false}
        setInputShown={vi.fn()}
        placeholder=""
      />,
    );

    const ghostTask = screen.getByRole("listitem");

    expect(ghostTask).toBeInTheDocument();
    expect(ghostTask).toHaveClass("ghost-task");
  });
});
