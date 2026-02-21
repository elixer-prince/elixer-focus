import Task from "@/features/tasks/components/Task";
import { useSetTasks, useTasks } from "@/features/tasks/stores/tasks-store";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";

const TaskList = () => {
  const tasks = useTasks();
  const setTasks = useSetTasks();

  const handleDragEnd: Parameters<typeof DragDropProvider>[0]["onDragEnd"] = (
    event,
  ) => {
    const nextTasks = move(tasks, event);
    setTasks(nextTasks);
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <ul>
        {tasks.map(({ id, title, description }, index) => (
          <Task
            key={id}
            id={id}
            title={title}
            description={description}
            index={index}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};

export default TaskList;
