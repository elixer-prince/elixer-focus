import DeleteButton from "@/features/tasks/components/Task/DeleteButton";
import { fireEvent, render, screen } from "@testing-library/react";

describe("DeleteButton", () => {
  it("should render", () => {
    render(<DeleteButton id="ExStr123f51" isCompleted={false} />);

    const deleteButton = screen.getByRole("button");

    expect(deleteButton).toBeInTheDocument();
  });

  it("should render with delete if not completed", () => {
    render(<DeleteButton id="ExStr123f51" isCompleted={false} />);

    const deleteButton = screen.getByRole("button");

    expect(deleteButton).toHaveTextContent(/delete/i);
  });

  it("should render with dismiss if completed", () => {
    render(<DeleteButton id="ExStr123f51" isCompleted />);

    const deleteButton = screen.getByRole("button");

    expect(deleteButton).toHaveTextContent(/dismiss/i);
  });

  it("should be crossed out when completed", () => {
    render(<DeleteButton id="ExStr123f51" isCompleted />);

    const deleteButton = screen.getByRole("button");

    expect(deleteButton).toHaveClass("line-through");
  });

  it("asks for confirmation before deleting a task with subtasks", () => {
    render(
      <DeleteButton id="ExStr123f51" isCompleted={false} subtaskCount={2} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "This task has 2 subtasks. Deleting it removes all of them.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });
});
