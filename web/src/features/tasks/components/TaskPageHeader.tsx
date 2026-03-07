import { useAddTask } from "@/features/tasks/stores/tasks-store";
import { useRef } from "react";

const TaskPageHeader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addTask = useAddTask();

  return (
    <div className="task-header debug-border">
      <h1 className="task-header__title mb-4 text-center text-4xl font-bold">
        Your Tasks
      </h1>

      <div className="mx-auto flex max-w-100 items-center justify-center gap-4 max-sm:flex-col">
        <input
          ref={inputRef}
          type="text"
          className="input input-primary placeholder:text-primary-content/75 border-primary-content/50 mx-auto block placeholder:italic"
          placeholder="Do the laundry..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              const inputValue = event.currentTarget.value;
              if (inputValue.trim() === "") {
                event.currentTarget.value = "";
                return;
              }
              addTask(inputValue);
              event.currentTarget.value = "";
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
