import Task from "@/features/tasks/components/Task";
import { useSetTasks, useTasks } from "@/features/tasks/stores/tasks-store";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";

const TaskList = () => {
  const tasks = useTasks();
  // const setTasks = useSetTasks();

  const handleDragEnd = (event: DragEndEvent) => {
    // if (event.canceled) return;
    // setTasks((items) => move(items, event));
  };

  return (
    <DragDropProvider onDragEnd={() => handleDragEnd}>
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
