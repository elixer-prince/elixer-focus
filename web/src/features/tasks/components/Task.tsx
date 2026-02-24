import {
  useRemoveTask,
  useToggleTaskCompletion,
} from "@/features/tasks/stores/tasks-store";
import { useSortable } from "@dnd-kit/react/sortable";

interface TaskProps {
  index: number;
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

const Task = ({ index, id, title, description, isCompleted }: TaskProps) => {
  const removeTask = useRemoveTask();
  const toggleTaskCompletion = useToggleTaskCompletion();

  const { ref } = useSortable({ id, index });

  return (
    <li
      ref={ref}
      className="task bg-base-300 flex cursor-grab items-center gap-1 rounded-md px-4 py-2"
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={() => toggleTaskCompletion(id, !isCompleted)}
      />
      <p className={isCompleted ? "text-base-content/50 line-through" : ""}>
        {title}
      </p>
      <p>{description}</p>
      <button
        className={`error-button cursor-pointer ${isCompleted ? "text-error/50 line-through" : "text-error hover:underline"}`.trim()}
        onClick={() => removeTask(id)}
      >
        Remove
      </button>
    </li>
  );
};

export default Task;
