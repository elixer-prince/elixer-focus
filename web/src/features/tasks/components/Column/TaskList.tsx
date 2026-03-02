import Ghost from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useAddTask, useTasks } from "@/features/tasks/stores/tasks-store";
import type { TaskCategory } from "@/features/tasks/types/task";
import type { Dispatch, SetStateAction } from "react";

interface TaskListProps {
  category: TaskCategory;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
  placeholder: string;
}

const TaskList = ({
  category,
  inputShown,
  setInputShown,
  placeholder,
}: TaskListProps) => {
  const allTasks = useTasks();
  const tasks = allTasks.filter((task) => task.category === category);

  const addTask = useAddTask();

  return (
    <ul className="tasks-container__task-list flex flex-col gap-4 overflow-auto pt-1 pr-1 pb-4 pl-4">
      {category !== "uncategorised" && inputShown && (
        <div className="mr-3">
          <input
            type="text"
            placeholder={placeholder}
            className="task-input input border-primary-content/25 input-primary w-full border placeholder:italic"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (event.currentTarget.value.trim() === "") {
                  event.currentTarget.value = "";
                  return;
                }
                addTask(event.currentTarget.value, "", category);
                event.currentTarget.value = "";
                setInputShown(false);
              }
            }}
          />
        </div>
      )}

      {tasks.length === 0 && !inputShown && <Ghost />}

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
