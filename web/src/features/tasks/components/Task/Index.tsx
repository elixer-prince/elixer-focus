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

  const { ref, isDragging } = useSortable({
    id,
    index,
    type: "task",
    accept: "task",
    group: category,
  });

  return (
    <li
      ref={ref}
      data-dragging={isDragging}
      className={`task bg-base-100 flex cursor-grab items-center justify-between gap-1 rounded-md border px-3 py-2 ${index === 0 ? "outline-primary outline" : ""} ${isSelected ? "border-primary" : "border-base-content/25"}`.trim()}
    >
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => toggleTaskCompletion(id, !isCompleted)}
        />
        <p className={isCompleted ? "text-base-content/50 line-through" : ""}>
          {title}
        </p>
        <div className="font-bold text-red-500">i: {index}</div>
        <p>{description}</p>
      </div>

      <DeleteButton id={id} isCompleted={isCompleted} />
    </li>
  );
};

export default Task;
