import { useAddTask } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";

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

  return (
    <input
      type="text"
      placeholder={placeholder}
      className="new-task-input input border-primary-content/25 input-primary w-full border placeholder:italic"
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
