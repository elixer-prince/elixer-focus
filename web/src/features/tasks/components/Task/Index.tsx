import DeleteButton from "@/features/tasks/components/Task/DeleteButton";
import { useToggleTaskCompletion } from "@/features/tasks/stores/tasks-store";
import { useSortable } from "@dnd-kit/react/sortable";

interface TaskProps {
  index: number;
  id: string;
  title: string;
  category: string;
  description?: string;
  isCompleted: boolean;
  isSelected: boolean;
}

const Task = ({
  index,
  id,
  title,
  category,
  description,
  isCompleted,
  isSelected,
}: TaskProps) => {
  const toggleTaskCompletion = useToggleTaskCompletion();

  const { ref } = useSortable({
    id,
    index,
    type: "task",
    accept: "task",
    group: category,
  });

  return (
    <li
      ref={ref}
      className={`task bg-base-100 flex cursor-grab items-center gap-1 rounded-md border px-4 py-2 ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
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
      <DeleteButton id={id} isCompleted={isCompleted} />
    </li>
  );
};

export default Task;
