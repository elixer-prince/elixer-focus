import NewTaskInput from "@/features/tasks/components/NewTaskInput";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  it("should clear the input on enter", async () => {
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={vi.fn()}
        placeholder=""
      />,
    );

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "Test task...");
    await userEvent.keyboard("{Enter}");

    expect((input as HTMLInputElement).value).toBe("");
  });
});
