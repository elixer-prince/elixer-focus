import Column from "@/features/tasks/components/Column/Index";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const ColumnMock = ({ pathname = "/tasks" }: { pathname?: string }) => {
  return (
    <MemoryRouter initialEntries={[pathname]}>
      <Column
        title="Column Title"
        category="urgent-important"
        inputPlaceholder=""
      />
    </MemoryRouter>
  );
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("Column", () => {
  it("should render column as an article element", () => {
    render(<ColumnMock />);

    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  it("should render the column title", () => {
    render(<ColumnMock />);

    const columnTitle = screen.getByRole("heading", {
      level: 2,
      name: /column title tasks/i,
    });

    expect(columnTitle).toBeInTheDocument();
  });

  it("should render an 'add task' button", () => {
    render(<ColumnMock />);

    const addTaskButton = screen.getByRole("button", {
      name: /add task/i,
    });

    expect(addTaskButton).toBeInTheDocument();
  });

  it("should not render an 'add task' button on the home page", () => {
    render(<ColumnMock pathname="/" />);

    const addTaskButton = screen.queryByRole("button", {
      name: /add task/i,
    });

    expect(addTaskButton).not.toBeInTheDocument();
  });

  it("should render the task list", () => {
    render(<ColumnMock />);

    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
