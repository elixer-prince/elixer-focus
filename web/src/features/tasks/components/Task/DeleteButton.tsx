import { useRemoveTask } from "@/features/tasks/stores/tasks-store";

interface DeleteButtonProps {
  id: string;
  isCompleted: boolean;
}

const DeleteButton = ({ id, isCompleted }: DeleteButtonProps) => {
  const removeTask = useRemoveTask();

  return (
    <button
      className={`error-button cursor-pointer ${isCompleted ? "text-error/50 line-through" : "text-error hover:underline"}`.trim()}
      onClick={() => removeTask(id)}
    >
      {isCompleted ? "Dismiss" : "Delete"}
    </button>
  );
};

export default DeleteButton;
