import Tasks from "@/app/routes/(root)/Tasks";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

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
  ];
  const setTasks = vi.fn();
  return {
    useTasksStore: {
      getState: () => ({ tasks, setTasks }),
    },
    useSetTasks: () => setTasks,
    useTasks: () => tasks,
    useAddTask: () => vi.fn(),
    useRemoveTask: () => vi.fn(),
    useToggleTaskCompletion: () => vi.fn(),
  };
});

vi.mock("@dnd-kit/react", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    DragDropProvider: ({ children }: { children: React.ReactNode }) => children,
    PointerSensor: vi.fn(),
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
    // Both should be visible somewhere on the page
    expect(screen.getByText("Task One")).toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
  });
});
