import Task from "@/features/tasks/components/Task";
import { useTasks } from "@/features/tasks/stores/tasks-store";

const TaskList = () => {
  const tasks = useTasks();

  return (
    <ul>
      {tasks.map(({ id, title, description }) => (
        <li key={id} className="task flex items-center gap-2 select-none">
          <Task id={id} title={title} description={description} />
        </li>
      ))}
    </ul>
  );
};

export default TaskList;
