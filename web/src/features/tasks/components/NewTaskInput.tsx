import { useAddTask } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";
import { useState } from "react";

type NewTaskInputProps = {
  placeholder?: string;
  setInputShown: React.Dispatch<React.SetStateAction<boolean>>;
  columnCategory: TaskCategory;
};

const NewTaskInput = ({
  columnCategory,
  setInputShown,
  placeholder,
}: NewTaskInputProps) => {
  const addTask = useAddTask();

  const [value, setValue] = useState<string>("");

  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      className="new-task-input input border-primary-content/25 input-primary w-full border placeholder:italic"
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          if (event.currentTarget.value.trim() === "") {
            event.currentTarget.value = "";
            return;
          }
          addTask(event.currentTarget.value, "", columnCategory);
          event.currentTarget.value = "";
          setInputShown(false);
        }
      }}
    />
  );
};

export default NewTaskInput;
