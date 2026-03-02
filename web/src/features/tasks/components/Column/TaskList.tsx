import Ghost from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useTasks } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";

interface TaskListProps {
  category: TaskCategory;
  inputShown: boolean;
}

const TaskList = ({ category, inputShown }: TaskListProps) => {
  const allTasks = useTasks();
  const tasks = allTasks.filter((task) => task.category === category);

  return (
    <ul className="tasks-container__task-list flex flex-col gap-4 overflow-auto border pt-0.5 pr-1 pb-4 pl-4">
      <div
        className={category === "uncategorised" ? "hidden" : "mr-3 space-y-4"}
      >
        {category !== "uncategorised" && inputShown && (
          <input
            type="text"
            className="task-input input border-primary-content/25 input-primary mt-1 w-full"
          />
        )}

        {tasks.length === 0 && !inputShown && <Ghost />}
      </div>

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

export default TaskList;
