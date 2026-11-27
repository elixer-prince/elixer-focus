import ColumnHeader from "@/features/tasks/components/Column/Header";
import TaskList from "@/features/tasks/components/Column/TaskList";
import type { Task, TaskCategory } from "@/features/tasks/types/task";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useState } from "react";

interface ColumnProps {
  title: string;
  category: TaskCategory;
  inputPlaceholder: string;
  isDragging?: boolean;
  isSortingDisabled?: boolean;
  tasks?: Task[];
  taskSurface?: "matrix" | "home";
  onTaskExitStart?: (id: string) => void;
  onTaskExitEnd?: (id: string, wasFocused: boolean) => void;
}

const Column = ({
  title,
  category,
  inputPlaceholder,
  isDragging = false,
  isSortingDisabled = false,
  tasks,
  taskSurface = "home",
  onTaskExitStart,
  onTaskExitEnd,
}: ColumnProps) => {
  const [inputShown, setInputShown] = useState(false);

  const { ref, isDropTarget } = useDroppable({
    id: category,
    type: "task",
    accept: "task",
    collisionPriority: CollisionPriority.Low,
  });
  const widthClass = taskSurface === "matrix" ? "max-w-none" : "max-w-92";

  return (
    <article
      ref={ref}
      className={`tasks-container tasks-list hover:outline-primary/75 bg-base-200 border-base-content/25 static flex h-fit max-h-60 w-full ${widthClass} flex-col overflow-hidden rounded-md border shadow-sm outline-2 outline-transparent transition-colors duration-500 ${isDropTarget ? "outline-primary/75 outline-2" : ""}`.trim()}
    >
      <ColumnHeader
        title={title}
        category={category}
        inputShown={inputShown}
        setInputShown={setInputShown}
        isDragging={isDragging}
        isTaskMatrix={taskSurface === "matrix"}
      />

      <TaskList
        columnCategory={category}
        inputShown={inputShown}
        setInputShown={setInputShown}
        placeholder={inputPlaceholder}
        isDragging={isDragging}
        isSortingDisabled={isSortingDisabled}
        tasks={tasks}
        taskSurface={taskSurface}
        onTaskExitStart={onTaskExitStart}
        onTaskExitEnd={onTaskExitEnd}
      />
    </article>
  );
};

export default Column;
