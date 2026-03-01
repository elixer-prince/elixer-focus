import { useAddTask } from "@/features/tasks/stores/tasks-store";
import { useRef } from "react";

const TaskHeader = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addTask = useAddTask();

  return (
    <div className="task-header">
      <h1 className="task-header__title mb-4 text-center text-4xl font-bold">
        Your Tasks
      </h1>

      <div className="mx-auto flex w-fit items-center gap-4">
        <input
          ref={inputRef}
          type="text"
          className="input input-primary placeholder:text-primary-content/75 border-primary-content/50 mx-auto block placeholder:italic"
          placeholder="Do the laundry..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addTask(event.currentTarget.value);
              event.currentTarget.value = "";
            }
          }}
        />

        <button
          className="btn btn-primary"
          onClick={() => {
            if (!inputRef.current) return;
            addTask(inputRef.current?.value);
            inputRef.current.value = "";
          }}
        >
          Add task
        </button>
      </div>
    </div>
  );
};

export default TaskHeader;
