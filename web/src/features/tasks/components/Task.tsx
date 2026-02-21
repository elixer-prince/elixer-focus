import { useRemoveTask } from "@/features/tasks/stores/tasks-store";

interface TaskProps {
  id: string;
  title: string;
  description?: string;
}

const Task = ({ id, title, description }: TaskProps) => {
  const removeTask = useRemoveTask();

  return (
    <>
      <p>{title}</p>
      {/* TODO: Optional if present */}
      <p>{description}</p>
      <button
        className="text-error cursor-pointer hover:underline"
        onClick={() => removeTask(id)}
      >
        Remove
      </button>
    </>
  );
};

export default Task;
