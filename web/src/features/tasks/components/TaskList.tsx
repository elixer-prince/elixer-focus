import { useTasks } from "../stores/tasks-store";

const TaskList = () => {
  const tasks = useTasks();

  return (
    <ul>
      {tasks.map((task) => (
        <li key={task}>{task}</li>
      ))}
    </ul>
  );
};

export default TaskList;
