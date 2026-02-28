import Ghost from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "../types/task";

interface ColumnProps {
  title: string;
  category: TaskCategory;
}

const Column = ({ title, category }: ColumnProps) => {
  const allTasks = useTasks();
  const tasks = allTasks.filter((task) => task.category === category);

  // BUG: tasks are not sorting properly on the tasks page, except for the last one

  return (
    <div className="tasks-container mb-8 h-fit w-100">
      <ul className="tasks-list hover:outline-primary/75 bg-base-200 border-base-content/25 right-0 flex flex-col gap-4 rounded-md border p-4 outline-2 outline-transparent transition-colors duration-300">
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
    </div>
  );
};

export default Column;
