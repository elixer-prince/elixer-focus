import Ghost from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";

interface ColumnProps {
  title: string;
  category: TaskCategory;
}

const Column = ({ title, category }: ColumnProps) => {
  const allTasks = useTasks();
  const tasks = allTasks.filter((task) => task.category === category);

  const { ref, isDropTarget } = useDroppable({
    id: category,
    type: "task",
    accept: "task",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <ul
      ref={ref}
      className={`tasks-container tasks-list hover:outline-primary/75 bg-base-200 border-base-content/25 right-0 flex h-fit w-100 flex-col gap-4 rounded-md border p-4 outline-2 outline-transparent transition-colors duration-300 ${isDropTarget ? "outline-primary/75 outline-2" : ""}`.trim()}
    >
      <h2 className="tasks-list__heading text-center text-2xl font-bold select-none">
        {title}
      </h2>

      {tasks.length === 0 && <Ghost />}

      {tasks.map(
        (
          { id, title, description, category, isCompleted, isSelected },
          index,
        ) => (
          <Task
            key={id}
            id={id}
            title={title}
            category={category}
            description={description}
            isCompleted={isCompleted}
            isSelected={isSelected}
            index={index}
          />
        ),
      )}
    </ul>
  );
};

export default Column;
