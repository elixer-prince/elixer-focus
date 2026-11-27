import { Input } from "@/components/ui";
import { useAddTask } from "@/features/tasks/stores/tasks-store";
import type { TaskSortMode } from "@/features/tasks/utils/task-due-date";
import { useRef, useState } from "react";

interface TaskPageHeaderProps {
  isDragging?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMode: TaskSortMode;
  onSortModeChange: (sortMode: TaskSortMode) => void;
}

const TaskPageHeader = ({
  isDragging = false,
  searchQuery,
  onSearchChange,
  sortMode,
  onSortModeChange,
}: TaskPageHeaderProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const addTask = useAddTask();

  const [value, setValue] = useState<string>("");

  return (
    <header className="task-header mx-auto w-full max-w-5xl">
      <h1 className="task-header__title text-base-content mb-5 text-left text-3xl font-bold tracking-tight sm:text-4xl">
        Your Tasks
      </h1>

      <div className="task-panel rounded-box border-base-content/15 bg-base-200 grid gap-5 border p-4 shadow-sm transition-colors duration-500 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            ref={inputRef}
            aria-label="Uncategorised task input"
            type="text"
            placeholder="A random task..."
            value={value}
            disabled={isDragging}
            className="new-task-input input input-primary border-primary-content/50 placeholder:text-primary-content/75 min-h-12 w-full min-w-0 flex-1 placeholder:italic"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (isDragging) return;
              if (event.key === "Enter") {
                const inputValue = event.currentTarget.value;
                if (inputValue.trim() === "") {
                  setValue("");
                  return;
                }
                addTask(inputValue);
                setValue("");
              }
            }}
          />

          <button
            className="btn btn-primary min-h-12 shrink-0 sm:px-6"
            disabled={isDragging}
            onClick={() => {
              if (isDragging) return;
              if (inputRef.current?.value.trim() === "") {
                setValue("");
                return;
              }
              addTask(value);
              setValue("");
            }}
          >
            Create task
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <Input
            label="Search tasks"
            name="taskSearch"
            type="search"
            inputSize="sm"
            placeholder="Title or description…"
            autoComplete="off"
            value={searchQuery}
            disabled={isDragging}
            className="w-full"
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <label className="flex flex-col gap-1 text-sm font-medium">
            <span>Sort tasks</span>
            <select
              className="select select-bordered select-sm bg-base-100 min-h-11 w-full"
              value={sortMode}
              disabled={isDragging}
              onChange={(event) =>
                onSortModeChange(event.target.value as TaskSortMode)
              }
            >
              <option value="manual">Manual order</option>
              <option value="due-date">Due date, soonest first</option>
            </select>
          </label>
        </div>
      </div>
    </header>
  );
};

export default TaskPageHeader;
