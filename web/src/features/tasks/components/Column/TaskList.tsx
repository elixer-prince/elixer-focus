import NewTaskInput from "@/features/tasks/components/NewTaskInput";
import GhostTask from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useTasks } from "@/stores";
import type {
  Task as TaskData,
  TaskCategory,
} from "@/features/tasks/types/task";
import type { Dispatch, SetStateAction } from "react";

interface TaskListProps {
  columnCategory: TaskCategory;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
  placeholder: string;
  isDragging?: boolean;
  tasks?: TaskData[];
  taskSurface?: "matrix" | "home";
}

const TaskList = ({
  columnCategory,
  inputShown,
  setInputShown,
  placeholder,
  isDragging = false,
  tasks: previewTasks,
  taskSurface = "home",
}: TaskListProps) => {
  const allTasks = useTasks();
  const tasks = (previewTasks ?? allTasks).filter(
    (task) => task.category === columnCategory,
  );

  return (
    <ul
      tabIndex={-1}
      className="tasks-container__task-list flex flex-col gap-4 overflow-auto pt-1 pr-1 pb-4 pl-4"
    >
      {columnCategory !== "uncategorised" && inputShown && (
        <div className="mr-3">
          <NewTaskInput
            columnCategory={columnCategory}
            setInputShown={setInputShown}
            placeholder={placeholder}
            disabled={isDragging}
          />
        </div>
      )}

      {tasks.length === 0 && !inputShown && <GhostTask />}

      {tasks.map(
        (
          {
            id,
            title,
            description,
            category,
            isCompleted,
            isSelected,
            updatedAt,
          },
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
            updatedAt={updatedAt}
            index={index}
            taskSurface={taskSurface}
          />
        ),
      )}
    </ul>
  );
};

export default TaskList;
