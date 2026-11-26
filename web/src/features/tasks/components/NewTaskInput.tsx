import { useAddTask } from "@/stores";
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
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async (title: string) => {
    setIsAdding(true);
    try {
      const result = await addTask(title, "", columnCategory);
      if (result?.success !== false) {
        setValue("");
        setInputShown(false);
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <input
      type="text"
      name="taskTitle"
      aria-label="New task title"
      autoComplete="off"
      value={value}
      disabled={disabled || isAdding}
      placeholder={placeholder}
      className="new-task-input input border-primary-content/25 input-primary w-full border placeholder:italic"
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (!disabled && !isAdding && event.key === "Enter") {
          if (event.currentTarget.value.trim() === "") {
            setValue("");
            return;
          }
          void handleAddTask(event.currentTarget.value);
        }
      }}
    />
  );
};

export default NewTaskInput;
