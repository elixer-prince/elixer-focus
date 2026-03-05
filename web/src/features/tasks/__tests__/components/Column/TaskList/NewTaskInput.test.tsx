import NewTaskInput from "@/features/tasks/components/Column/TaskList/NewTaskInput";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Column.TaskList.NewTaskInput", () => {
  it("should render a text input", () => {
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={vi.fn()}
        placeholder=""
      />,
    );

    expect(screen.queryByRole("textbox")).toBeInTheDocument();
  });

  it("should clear the input on enter", () => {
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={vi.fn()}
        placeholder=""
      />,
    );

    const input = screen.getByRole("textbox");

    // Simulate typing
    fireEvent.change(input, { target: { value: "Test task" } });
    expect((input as HTMLInputElement).value).toBe("Test task");

    // Simulate pressing enter
    fireEvent.keyDown(input, { key: "Enter" });

    expect((input as HTMLInputElement).value).toBe("");
  });
});
