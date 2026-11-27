import Tasks from "@/app/routes/my/Tasks";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";

// Mocks

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: vi.fn(),
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: vi.fn(() => ({
    updatePageTitle: vi.fn(),
  })),
}));

vi.mock("@/features/tasks/stores/tasks-store", () => {
  const tasks = [
    {
      id: "1",
      title: "Task One",
      category: "uncategorised",
      isCompleted: false,
      isSelected: false,
      createdAt: 0,
    },
    {
      id: "2",
      title: "Task Two",
      category: "urgent-important",
      isCompleted: false,
      isSelected: false,
      createdAt: 0,
    },
    {
      id: "3",
      title: "Quiet Work",
      description: "Practice mindful focus",
      category: "not-urgent-important",
      isCompleted: false,
      isSelected: false,
      createdAt: 0,
    },
    {
      id: "4",
      title: "Archived Work",
      category: "urgent-important",
      isCompleted: true,
      isSelected: false,
      createdAt: 0,
      updatedAt: 200,
      completedAt: 200,
    },
  ];
  const setTasks = vi.fn();
  return {
    useTasksStore: {
      getState: () => ({ tasks, setTasks }),
    },
    useSetTasks: () => setTasks,
    useReorderTasks: () => setTasks,
    useTasks: () => tasks,
    useAddTask: () => vi.fn(),
    useRemoveTask: () => vi.fn(),
    useToggleTaskCompletion: () => vi.fn(),
    useUpdateTask: () => vi.fn(),
  };
});

vi.mock("@dnd-kit/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const PointerSensor = {
    configure: () => PointerSensor,
  };
  return {
    ...actual,
    DragDropProvider: ({ children }: { children: React.ReactNode }) => children,
    PointerSensor,
  };
});

vi.mock("@dnd-kit/dom", () => {
  const KeyboardSensor = {};
  return {
    PointerActivationConstraints: {
      Distance: class {
        constructor() {}
      },
      Delay: class {
        constructor() {}
      },
    },
    KeyboardSensor,
  };
});

vi.mock("@dnd-kit/react/sortable", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    isSortable: vi.fn(() => true),
  };
});

vi.mock("@dnd-kit/helpers", () => ({
  move: vi.fn((list) => {
    // Simulate moving an item within the same group
    return list;
  }),
}));

const CurrentLocation = () => {
  const { search } = useLocation();
  return <span data-testid="current-search">{search}</span>;
};

// Teardown

afterEach(() => {
  vi.clearAllMocks();
});

// Test Suite

describe("Tasks page", () => {
  it("should render all five task columns", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    const columns = screen.getAllByRole("article");
    expect(columns).toHaveLength(5);
  });

  it("should render the uncategorised column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText(/uncategorised/i)).toBeInTheDocument();
  });

  it("should render the urgent and important column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText(/urgent and important/i)).toBeInTheDocument();
  });

  it("should render the not urgent but important column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText(/not urgent but important/i)).toBeInTheDocument();
  });

  it("should render the urgent but not important column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText(/urgent but not important/i)).toBeInTheDocument();
  });

  it("should render the not urgent nor important column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText(/not urgent nor important/i)).toBeInTheDocument();
  });

  it("should render tasks from the store", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
  });

  it("should only show tasks in their matching category column", () => {
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    // Task One is uncategorised, Task Two is urgent-important
    // Verify each task appears in its expected column
    const columns = screen.getAllByRole("article");
    const uncategorisedColumn = columns.find((col) =>
      within(col).queryByText(/uncategorised/i),
    );
    const urgentImportantColumn = columns.find((col) =>
      within(col).queryByText(/urgent and important/i),
    );

    expect(uncategorisedColumn).not.toBeNull();
    expect(urgentImportantColumn).not.toBeNull();

    expect(
      within(uncategorisedColumn!).getByText("Task One"),
    ).toBeInTheDocument();
    expect(
      within(urgentImportantColumn!).getByText("Task Two"),
    ).toBeInTheDocument();
  });

  it("AC-3 and AC-4: keeps completed tasks in a collapsed archive outside active search", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    const archiveButton = screen.getByRole("button", {
      name: /completed tasks/i,
    });
    expect(archiveButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("checkbox", { name: "Reopen Archived Work" }),
    ).not.toBeInTheDocument();

    await user.click(archiveButton);
    expect(archiveButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Archived Work")).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: /search tasks/i }),
      "mindful",
    );

    expect(screen.getByText("Archived Work")).toBeInTheDocument();
    expect(screen.queryByText("Task One")).not.toBeInTheDocument();
    expect(screen.queryByText("Task Two")).not.toBeInTheDocument();
  });

  it("filters tasks by title or description across the matrix", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Tasks />
        <CurrentLocation />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByRole("searchbox", { name: /search tasks/i }),
      "mindful",
    );

    expect(screen.getByText("Quiet Work")).toBeInTheDocument();
    expect(screen.queryByText("Task One")).not.toBeInTheDocument();
    expect(screen.queryByText("Task Two")).not.toBeInTheDocument();
    expect(screen.getByTestId("current-search")).toHaveTextContent(
      "?taskSearch=mindful",
    );
  });

  it("shows a message when no tasks match the search", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Tasks />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByRole("searchbox", { name: /search tasks/i }),
      "missing task",
    );

    expect(
      screen.getByText("No tasks match “missing task”."),
    ).toBeInTheDocument();
  });
});
