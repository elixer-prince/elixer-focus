import { useAddTask } from "@/features/tasks/stores/tasks-store";
import { useRef, useState } from "react";

const TaskPageHeader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const addTask = useAddTask();

  const [value, setValue] = useState<string>("");

  return (
    <div className="task-header">
      <h1 className="task-header__title mb-4 text-center text-4xl font-bold">
        Your Tasks
      </h1>

      <div className="debug-border task-panel mx-auto flex max-w-100 items-center justify-center gap-4 max-sm:flex-col">
        <input
          ref={inputRef}
          value={value}
          type="text"
          className="new-task-input input input-primary placeholder:text-primary-content/75 border-primary-content/50 mx-auto block placeholder:italic"
          placeholder="Do the laundry..."
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
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
          className="btn btn-primary"
          onClick={() => {
            if (!inputRef.current) return;
            if (inputRef.current.value.trim() === "") {
              inputRef.current.value = "";
              return;
            }
            addTask(inputRef.current?.value);
            inputRef.current.value = "";
          }}
        >
          Create task
        </button>
      </div>
    </div>
  );
};

export default TaskPageHeader;
