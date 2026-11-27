import Header from "@/features/tasks/components/Column/Header";
import { render, screen } from "@testing-library/react";

afterEach(() => {
  vi.clearAllMocks();
});

describe("Column.Header", () => {
  it("should render", () => {
    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown={false}
        setInputShown={vi.fn()}
        isTaskMatrix
      />,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("should render the column category", () => {
    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown={false}
        setInputShown={vi.fn()}
        isTaskMatrix
      />,
    );

    const h2 = screen.getByRole("heading", { level: 2 });

    expect(h2).toBeInTheDocument();
    expect(h2).toHaveTextContent("Column Header");
  });

  it("should render an add task button if the input is not shown", () => {
    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown={false}
        setInputShown={vi.fn()}
        isTaskMatrix
      />,
    );

    const addTaskButton = screen.getByRole("button");

    expect(addTaskButton).toBeInTheDocument();
    expect(addTaskButton).toHaveTextContent(/add task/i);
  });

  it("should render a cancel button if the input is shown", () => {
    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown
        setInputShown={vi.fn()}
        isTaskMatrix
      />,
    );

    const cancelButton = screen.getByRole("button");

    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent(/cancel/i);
  });

  it("should not render matrix actions outside the task matrix", () => {
    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown={false}
        setInputShown={vi.fn()}
      />,
    );

    const addTaskButton = screen.queryByRole("button", { name: /add task/i });
    const cancelButton = screen.queryByRole("button", { name: /cancel/i });

    expect(addTaskButton).not.toBeInTheDocument();
    expect(cancelButton).not.toBeInTheDocument();
  });
});
