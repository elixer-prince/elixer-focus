import Task from "@/features/tasks/components/Task";
import { useSetTasks, useTasks } from "@/features/tasks/stores/tasks-store";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";

const TaskList = ({ title }: { title: string }) => {
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
      <div className="mb-8 h-fit w-100">
        <ul className="bg-base-200 border-base-content/25 right-0 flex flex-col gap-4 rounded-md border p-4">
          <h2 className="text-center text-2xl font-bold">{title}</h2>
          {tasks.map(({ id, title, description, isCompleted }, index) => (
            <Task
              key={id}
              id={id}
              title={title}
              description={description}
              isCompleted={isCompleted}
              index={index}
            />
          ))}
        </ul>
      </div>
    </DragDropProvider>
  );
};

export default TaskList;
