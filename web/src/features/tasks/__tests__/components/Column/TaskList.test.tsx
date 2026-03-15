import TaskList from "@/features/tasks/components/Column/TaskList";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import { render, screen } from "@testing-library/react";
import type { Mock } from "vitest";

// Mocks

vi.mock("@/features/tasks/stores/tasks-store", () => ({
  useAddTask: vi.fn(),
  useRemoveTask: vi.fn(),
  useToggleTaskCompletion: vi.fn(),
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
