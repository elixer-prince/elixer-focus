import Task from "@/features/tasks/components/Task/Index";
import { render, screen } from "@testing-library/react";

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    ref: (element: Element) => element,
    isDragging: true,
  }),
}));

beforeEach(() => {
  render(
    <Task
      index={0}
      id="ExStr123f51"
      title="A random Task!"
      category=""
      isCompleted={false}
      isSelected={false}
    />,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Task", () => {
  it("should render", () => {
    const task = screen.getByRole("listitem");

    expect(task).toBeInTheDocument();
  });

  it("should have a checkbox", () => {
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeInTheDocument();
  });

  it("should show a paragraph with the task title", () => {
    const taskTitle = screen.getByText("A random Task!");

    expect(taskTitle).toBeInTheDocument();
    expect(taskTitle).toHaveTextContent("A random Task!");
  });

  it("should have a delete/dismiss button", () => {
    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/delete/i);
  });
});
