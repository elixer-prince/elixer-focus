import Ghost from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useAddTask, useTasks } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";

interface TaskListProps {
  category: TaskCategory;
  inputShown: boolean;
  placeholder: string;
}

const TaskList = ({ category, inputShown, placeholder }: TaskListProps) => {
  const allTasks = useTasks();
  const tasks = allTasks.filter((task) => task.category === category);

  const addTask = useAddTask();

  return (
    <ul className="tasks-container__task-list flex flex-col gap-4 overflow-auto pt-1 pr-1 pb-4 pl-4">
      <div className={tasks.length === 0 ? "mr-3 space-y-4" : "hidden"}>
        {category !== "uncategorised" && inputShown && (
          <input
            type="text"
            placeholder={placeholder}
            className="task-input input border-primary-content/25 input-primary w-full placeholder:italic"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (event.currentTarget.value.trim() === "") {
                  event.currentTarget.value = "";
                  return;
                }
                addTask(event.currentTarget.value, "", category);
                event.currentTarget.value = "";
              }
            }}
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
