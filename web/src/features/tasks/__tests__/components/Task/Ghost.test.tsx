import Ghost from "@/features/tasks/components/Task/Ghost";
import { render, screen } from "@testing-library/react";

describe("Ghost", () => {
  it("should render a ghost task", () => {
    render(<Ghost />);

    const listItem = screen.getByRole("listitem");

    expect(listItem).toBeInTheDocument();
    expect(listItem).toHaveClass("ghost-task");
  });
});
