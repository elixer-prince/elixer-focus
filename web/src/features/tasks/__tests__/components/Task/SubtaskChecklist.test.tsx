import SubtaskChecklist from "@/features/tasks/components/Task/SubtaskChecklist";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

type TestSubtask = {
  id: string;
  taskId: string;
  parentSubtaskId: string | null;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
};

const mocks = vi.hoisted(() => ({
  subtasks: [] as TestSubtask[],
  supported: true as boolean | null,
  add: vi.fn(),
  update: vi.fn(),
  toggle: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/stores", () => ({
  useAddSubtask: () => mocks.add,
  useRemoveSubtask: () => mocks.remove,
  useSubtaskCoordinatorSupport: () => mocks.supported,
  useSubtasks: () => mocks.subtasks,
  useToggleSubtaskCompletion: () => mocks.toggle,
  useUpdateSubtask: () => mocks.update,
}));

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({ ref: vi.fn(), isDragging: false }),
}));

const makeSubtask = (
  id: string,
  title: string,
  parentSubtaskId: string | null = null,
  position = 0,
  isCompleted = false,
): TestSubtask => ({
  id,
  taskId: "task-1",
  parentSubtaskId,
  title,
  isCompleted,
  position,
  createdAt: 1,
  updatedAt: 1,
});

const openChecklist = () =>
  fireEvent.click(
    screen.getByRole("button", { name: /^Expand subtasks for Plan/ }),
  );

beforeEach(() => {
  mocks.subtasks = [];
  mocks.supported = true;
  mocks.add.mockReset().mockResolvedValue({ success: true });
  mocks.update.mockReset().mockResolvedValue({ success: true });
  mocks.toggle.mockReset().mockResolvedValue({ success: true });
  mocks.remove.mockReset().mockResolvedValue({ success: true });
});

describe("SubtaskChecklist", () => {
  it("starts collapsed and shows direct child progress at each level", () => {
    mocks.subtasks = [
      makeSubtask("root", "Root", null, 0, true),
      makeSubtask("child", "Child", "root", 0),
      makeSubtask("grandchild", "Grandchild", "child", 0, true),
    ];
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);

    const rootDisclosure = screen.getByRole("button", {
      name: "Expand subtasks for Plan, 1 of 1 complete",
    });
    expect(rootDisclosure).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "Root" }),
    ).not.toBeInTheDocument();

    fireEvent.click(rootDisclosure);
    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
    const childDisclosure = screen.getByRole("button", {
      name: "Expand subtasks for Root, 0 of 1 subtasks complete",
    });
    expect(childDisclosure).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("button", { name: "Grandchild" }),
    ).not.toBeInTheDocument();

    fireEvent.click(childDisclosure);
    const grandchildDisclosure = screen.getByRole("button", {
      name: "Expand subtasks for Child, 1 of 1 subtasks complete",
    });
    expect(grandchildDisclosure).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(grandchildDisclosure);
    expect(
      screen.getByRole("button", { name: "Grandchild" }),
    ).toBeInTheDocument();
  });

  it("trims additions and keeps the inline field after Escape or a failed save", async () => {
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);
    openChecklist();
    const input = screen.getByRole("textbox", {
      name: "Add a subtask to Plan in Plan",
    });

    fireEvent.change(input, { target: { value: "draft" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("");
    expect(
      screen.getByRole("textbox", { name: "Add a subtask to Plan in Plan" }),
    ).toBeInTheDocument();
    expect(mocks.add).not.toHaveBeenCalled();

    mocks.add.mockResolvedValueOnce({ success: false });
    fireEvent.change(input, { target: { value: "  Retry this  " } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() =>
      expect(mocks.add).toHaveBeenCalledWith("task-1", null, "Retry this"),
    );
    expect(input).toHaveValue("  Retry this  ");
  });

  it("saves a keyboard edit and keeps an empty title in the editor", async () => {
    mocks.subtasks = [makeSubtask("root", "Root")];
    mocks.update.mockImplementation(
      async (subtaskId: string, title: string) => {
        mocks.subtasks = mocks.subtasks.map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, title } : subtask,
        );
        return { success: true };
      },
    );
    const { rerender } = render(
      <SubtaskChecklist taskId="task-1" taskTitle="Plan" />,
    );
    openChecklist();
    fireEvent.click(screen.getByRole("button", { name: "Root" }));
    const editor = screen.getByRole("textbox", { name: "Subtask title" });

    fireEvent.change(editor, { target: { value: "  Renamed root  " } });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith("root", "Renamed root"),
    );
    rerender(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);
    expect(
      screen.getByRole("button", { name: "Renamed root" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Renamed root" }));
    const nextEditor = screen.getByRole("textbox", { name: "Subtask title" });
    mocks.update.mockResolvedValueOnce({ success: false });
    fireEvent.change(nextEditor, { target: { value: "  Retry rename  " } });
    fireEvent.keyDown(nextEditor, { key: "Enter" });

    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith("root", "Retry rename"),
    );
    expect(nextEditor).toHaveValue("  Retry rename  ");

    fireEvent.change(nextEditor, { target: { value: "  " } });
    fireEvent.keyDown(nextEditor, { key: "Enter" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A subtask title cannot be empty.",
    );
    expect(nextEditor).toBeInTheDocument();
    expect(mocks.update).toHaveBeenCalledTimes(2);
  });

  it("cancels an edit on outside click and returns focus after explicit cancel", () => {
    mocks.subtasks = [makeSubtask("root", "Root")];
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);
    openChecklist();
    fireEvent.click(screen.getByRole("button", { name: "Root" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Subtask title" }), {
      target: { value: "Unsaved title" },
    });
    fireEvent.mouseDown(document.body);

    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();
    expect(mocks.update).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Root" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Root" })).toHaveFocus();
  });

  it("confirms subtree deletion and leaves the tree untouched when cancelled", async () => {
    mocks.subtasks = [
      makeSubtask("root", "Root"),
      makeSubtask("child", "Child", "root"),
      makeSubtask("grandchild", "Grandchild", "child"),
    ];
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);
    openChecklist();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete subtask Root and its descendants",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "This also removes 2 nested subtasks.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Delete subtask Root and its descendants",
      }),
    );
    mocks.remove.mockResolvedValueOnce({ success: false });
    fireEvent.click(
      screen.getByRole("button", { name: "Remove 2 nested items" }),
    );
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith("root"));
    expect(
      screen.getByRole("button", { name: "Remove 2 nested items" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Root" })).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Remove 2 nested items" }),
    );
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith("root"));
  });

  it("disables mutations and asks for a refresh when a legacy tab owns coordination", () => {
    mocks.supported = false;
    mocks.subtasks = [makeSubtask("root", "Root")];
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Refresh the older tab to enable subtask changes.",
    );
    openChecklist();
    expect(
      screen.getByRole("checkbox", { name: "Mark Root complete" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Root" })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: "Add a subtask to Plan in Plan" }),
    ).toBeDisabled();
  });

  it("keeps mutations disabled until the coordinator confirms support", () => {
    mocks.supported = null;
    render(<SubtaskChecklist taskId="task-1" taskTitle="Plan" />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Waiting for a tab to confirm Subtask support.",
    );
    openChecklist();
    expect(
      screen.getByRole("textbox", { name: "Add a subtask to Plan in Plan" }),
    ).toBeDisabled();
  });
});
