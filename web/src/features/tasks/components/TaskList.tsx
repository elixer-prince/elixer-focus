import { useRemoveTask, useTasks } from "@/features/tasks/stores/tasks-store";

const TaskList = () => {
  const tasks = useTasks();
  const removeTask = useRemoveTask();

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task} className="task flex items-center gap-2 select-none">
          <p>{task}</p>
          <button
            className="text-error cursor-pointer hover:underline"
            onClick={() => removeTask}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
