import { useAddTask } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";
import { useState } from "react";

type NewTaskInputProps = {
  placeholder?: string;
  disabled?: boolean;
  setInputShown: React.Dispatch<React.SetStateAction<boolean>>;
  columnCategory: TaskCategory;
};

const NewTaskInput = ({
  columnCategory,
  setInputShown,
  placeholder,
  disabled,
}: NewTaskInputProps) => {
  const addTask = useAddTask();

  const [value, setValue] = useState<string>("");

  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      className="new-task-input input border-primary-content/25 input-primary w-full border placeholder:italic"
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (!disabled && event.key === "Enter") {
          if (event.currentTarget.value.trim() === "") {
            setValue("");
            return;
          }
          addTask(event.currentTarget.value, "", columnCategory);
          setValue("");
          setInputShown(false);
        }
      }}
    />
  );
};

export default NewTaskInput;
