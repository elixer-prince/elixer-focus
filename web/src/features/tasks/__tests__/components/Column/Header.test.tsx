import Header from "@/features/tasks/components/Column/Header";
import { render, screen } from "@testing-library/react";
import { useLocation } from "react-router";
import type { Mock } from "vitest";

vi.mock("react-router", () => ({
  useLocation: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("Column.Header", () => {
  it("should render", () => {
    (useLocation as Mock).mockReturnValue({ pathname: "/tasks" });

    render(
      <Header
        title="Column Header"
        category="urgent-important"
        inputShown={false}
        setInputShown={vi.fn()}
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
      />,
    );

    const cancelButton = screen.getByRole("button");

    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent(/cancel/i);
  });

  it("should not render the add task or cancel button on the home", () => {
    (useLocation as Mock).mockReturnValue({ pathname: "/" });

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
