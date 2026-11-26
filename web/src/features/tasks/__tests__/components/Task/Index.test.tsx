import Task from "@/features/tasks/components/Task/Index";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useCallback, useState } from "react";

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: () => ({
    ref: () => {},
    isDragging: false,
    handleRef: () => {},
  }),
}));

vi.mock("@/utils/date", () => ({
  formatRelativeTime: vi.fn(() => "just now"),
}));

const mockUpdateTask = vi.fn();
const mockToggleTaskCompletion = vi.fn();
const mockRemoveTask = vi.fn();

const mockedStore = vi.hoisted(() => {
  return {
    useToggleTaskCompletion: vi.fn(() => mockToggleTaskCompletion),
    useUpdateTask: vi.fn(() => mockUpdateTask),
    useRemoveTask: vi.fn(() => mockRemoveTask),
  };
});

vi.mock("@/stores", () => ({
  useToggleTaskCompletion: () => mockedStore.useToggleTaskCompletion(),
  useUpdateTask: () => mockedStore.useUpdateTask(),
  useRemoveTask: () => mockedStore.useRemoveTask(),
}));

afterEach(() => {
  vi.clearAllMocks();
  mockUpdateTask.mockClear();
  mockToggleTaskCompletion.mockClear();
});

beforeEach(() => {
  mockUpdateTask.mockResolvedValue({ success: true });
});

describe("Task", () => {
  it("should render", () => {
    render(
      <Task
        index={0}
        id="ExStr123f51"
        title="A random Task!"
        category=""
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const task = screen.getByRole("listitem");

    expect(task).toBeInTheDocument();
  });

  it("should have a checkbox", () => {
    render(
      <Task
        index={0}
        id="ExStr123f51"
        title="A random Task!"
        category=""
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeInTheDocument();
  });

  it("should show a paragraph with the task title", () => {
    render(
      <Task
        index={0}
        id="ExStr123f51"
        title="A random Task!"
        category=""
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const taskTitle = screen.getByText("A random Task!");

    expect(taskTitle).toBeInTheDocument();
    expect(taskTitle).toHaveTextContent("A random Task!");
  });

  it("should have a delete/dismiss button", () => {
    render(
      <Task
        index={0}
        id="ExStr123f51"
        title="A random Task!"
        category=""
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const button = screen.getByRole("button", { name: /delete/i });

    expect(button).toBeInTheDocument();
  });

  it("should have a drag handle", () => {
    render(
      <Task
        index={0}
        id="ExStr123f51"
        title="A random Task!"
        category=""
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const dragHandle = screen.getByLabelText("Drag to reorder");

    expect(dragHandle).toBeInTheDocument();
  });

  it("should not enter edit mode when double-clicking the drag handle", () => {
    render(
      <Task
        index={0}
        id="task-1"
        title="Edit Me"
        category="urgent-important"
        isCompleted={false}
        isSelected={false}
        updatedAt={Date.now()}
      />,
    );

    const dragHandle = screen.getByLabelText("Drag to reorder");
    fireEvent.click(dragHandle);
    fireEvent.click(dragHandle);

    const titleInput = screen.queryByRole("textbox", { name: "Task title" });
    expect(titleInput).not.toBeInTheDocument();
  });

  describe("inline editing", () => {
    it("should enter edit mode on double-click", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Edit Me"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      const taskTitle = screen.getByText("Edit Me");
      fireEvent.click(taskTitle);
      fireEvent.click(taskTitle);

      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveValue("Edit Me");
    });

    it("should show a description textarea in edit mode even without existing description", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="No Description"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      const taskTitle = screen.getByText("No Description");
      fireEvent.click(taskTitle);
      fireEvent.click(taskTitle);

      const textarea = screen.getByPlaceholderText("Description (optional)");
      expect(textarea).toBeInTheDocument();
    });

    it("should show the description textarea with existing value in edit mode", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Has Description"
          description="Existing description"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      const taskTitle = screen.getByText("Has Description");
      fireEvent.click(taskTitle);
      fireEvent.click(taskTitle);

      const textarea = screen.getByPlaceholderText("Description (optional)");
      expect(textarea).toHaveValue("Existing description");
    });

    it("should keep the checkbox visible during edit", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Edit Me"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      const taskTitle = screen.getByText("Edit Me");
      fireEvent.click(taskTitle);
      fireEvent.click(taskTitle);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    it("should hide the delete button during edit", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Edit Me"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Edit Me"));
      fireEvent.click(screen.getByText("Edit Me"));

      const deleteButton = screen.queryByText(/delete/i);
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("should save on Enter key and call updateTask", async () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });
      await act(async () => {
        fireEvent.keyDown(titleInput, { key: "Enter", code: "Enter" });
        await Promise.resolve();
      });

      expect(mockUpdateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated Title",
        description: undefined,
      });
    });

    it("should cancel edit on Escape and revert values", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original Title"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original Title"));
      fireEvent.click(screen.getByText("Original Title"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Changed" } });

      // Escape is caught by the window-level capture listener
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(screen.getByText("Original Title")).toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: "Task title" }),
      ).not.toBeInTheDocument();
    });

    it("should cancel edit when clicking the Cancel button and revert values", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original Title"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original Title"));
      fireEvent.click(screen.getByText("Original Title"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Changed" } });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.getByText("Original Title")).toBeInTheDocument();
      expect(
        screen.queryByRole("textbox", { name: "Task title" }),
      ).not.toBeInTheDocument();
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });

    it("should save when clicking the Save button", async () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        await Promise.resolve();
      });

      expect(mockUpdateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated Title",
        description: undefined,
      });
    });

    it("should keep the editor open when the save fails", async () => {
      mockUpdateTask.mockResolvedValueOnce({
        success: false,
        error: "Unable to save task",
      });
      render(
        <Task
          index={0}
          id="task-1"
          title="Original"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Updated Title" } });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save" }));
        await Promise.resolve();
      });

      expect(titleInput).toBeInTheDocument();
      expect(titleInput).toHaveValue("Updated Title");
    });

    it("should reject saving an empty title and keep editor open", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Not Empty"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Not Empty"));
      fireEvent.click(screen.getByText("Not Empty"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "   " } });
      fireEvent.keyDown(titleInput, { key: "Enter" });

      expect(mockUpdateTask).not.toHaveBeenCalled();
      expect(titleInput).toBeInTheDocument();
    });

    it("should display the description in view mode when present", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="With Desc"
          description="Some details"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      expect(screen.getByText("Some details")).toBeInTheDocument();
    });

    it("should cancel editing when clicking outside the task", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original Title"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      fireEvent.click(screen.getByText("Original Title"));
      fireEvent.click(screen.getByText("Original Title"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Changed" } });

      // Click outside the task element
      act(() => {
        document.body.dispatchEvent(
          new MouseEvent("mousedown", { bubbles: true }),
        );
      });

      // Should show original title, not saved
      expect(screen.getByText("Original Title")).toBeInTheDocument();
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });

    it("should allow double-click again after saving", async () => {
      // Use a wrapper component that updates the title prop after save
      function TaskWrapper() {
        const [title, setTitle] = useState("Original");
        const wrappedUpdateTask = useCallback(
          async (
            id: string,
            patch: { title?: string; description?: string },
          ) => {
            if (patch.title) setTitle(patch.title);
            mockUpdateTask(id, patch);
            return { success: true };
          },
          [],
        ) as typeof mockUpdateTask;

        mockedStore.useUpdateTask.mockImplementation(() => wrappedUpdateTask);

        return (
          <Task
            index={0}
            id="task-1"
            title={title}
            category="urgent-important"
            isCompleted={false}
            isSelected={false}
            updatedAt={Date.now()}
          />
        );
      }

      render(<TaskWrapper />);

      // First edit: enter edit mode, change title, save with Enter
      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Updated" } });
      await act(async () => {
        fireEvent.keyDown(titleInput, { key: "Enter", code: "Enter" });
        await Promise.resolve();
      });

      expect(mockUpdateTask).toHaveBeenCalledWith("task-1", {
        title: "Updated",
        description: undefined,
      });

      // Second edit: double-click again should enter edit mode with the updated title
      fireEvent.click(screen.getByText("Updated"));
      fireEvent.click(screen.getByText("Updated"));
      const titleInput2 = screen.getByRole("textbox", { name: "Task title" });
      expect(titleInput2).toBeInTheDocument();
      expect(titleInput2).toHaveValue("Updated");
    });

    it("should allow double-click again after canceling by Escape", () => {
      render(
        <Task
          index={0}
          id="task-1"
          title="Original"
          category="urgent-important"
          isCompleted={false}
          isSelected={false}
          updatedAt={Date.now()}
        />,
      );

      // First edit: enter edit mode, change title, cancel with Escape
      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput = screen.getByRole("textbox", { name: "Task title" });
      fireEvent.change(titleInput, { target: { value: "Changed" } });
      act(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      });

      expect(screen.getByText("Original")).toBeInTheDocument();

      // Second edit: double-click again should enter edit mode
      fireEvent.click(screen.getByText("Original"));
      fireEvent.click(screen.getByText("Original"));
      const titleInput2 = screen.getByRole("textbox", { name: "Task title" });
      expect(titleInput2).toBeInTheDocument();
      expect(titleInput2).toHaveValue("Original");
    });
  });
});
