import { useRemoveTask } from "@/features/tasks/stores/tasks-store";
import { useSortable } from "@dnd-kit/react/sortable";

interface TaskProps {
  index: number;
  id: string;
  title: string;
  description?: string;
}

const Task = ({ index, id, title, description }: TaskProps) => {
  const removeTask = useRemoveTask();

  const { ref } = useSortable({ id, index });

  return (
    <li ref={ref} className="task flex cursor-grab items-center gap-1">
      <p>{title}</p>
      {/* TODO: Optional if present */}
      <p>{description}</p>
      <button
        className="text-error cursor-pointer hover:underline"
        onClick={() => removeTask(id)}
      >
        Remove
      </button>
    </li>
  );
};

export default Task;
