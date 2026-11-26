import NewTaskInput from "@/features/tasks/components/NewTaskInput";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAddTask = vi.hoisted(() => vi.fn());

vi.mock("@/stores", () => ({
  useAddTask: () => mockAddTask,
}));

beforeEach(() => {
  mockAddTask.mockReset().mockResolvedValue({ success: true });
});

describe("Column.TaskList.NewTaskInput", () => {
  it("should render a text input", () => {
    const setInputShown = vi.fn();
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={setInputShown}
        placeholder=""
      />,
    );

    expect(screen.queryByRole("textbox")).toBeInTheDocument();
  });

  it("should clear the input on enter", async () => {
    const setInputShown = vi.fn();
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={setInputShown}
        placeholder=""
      />,
    );

    const input = screen.getByRole("textbox");

    await userEvent.type(input, "Test task...");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(input).toHaveValue(""));
    expect(setInputShown).toHaveBeenCalledWith(false);
  });

  it("keeps the task draft when persistence fails", async () => {
    mockAddTask.mockResolvedValueOnce({
      success: false,
      error: "Unable to save task",
    });
    const setInputShown = vi.fn();
    render(
      <NewTaskInput
        columnCategory="urgent-important"
        setInputShown={setInputShown}
        placeholder=""
      />,
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Keep this task");
    await userEvent.keyboard("{Enter}");

    await waitFor(() => expect(input).toHaveValue("Keep this task"));
    expect(setInputShown).not.toHaveBeenCalled();
  });
});
