import ColumnHeader from "@/features/tasks/components/Column/Header";
import TaskList from "@/features/tasks/components/Column/TaskList";
import type { TaskCategory } from "@/features/tasks/types/task";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useState } from "react";

interface ColumnProps {
  title: string;
  category: TaskCategory;
  inputPlaceholder: string;
}

const Column = ({ title, category, inputPlaceholder }: ColumnProps) => {
  const [inputShown, setInputShown] = useState(false);

  const { ref, isDropTarget } = useDroppable({
    id: category,
    type: "task",
    accept: "task",
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <article
      ref={ref}
      className={`tasks-container tasks-list hover:outline-primary/75 bg-base-200 border-base-content/25 static flex h-fit max-h-60 w-full max-w-92 flex-col overflow-hidden rounded-md border outline-2 outline-transparent transition-colors duration-300 ${isDropTarget ? "outline-primary/75 outline-2" : ""}`.trim()}
    >
      <ColumnHeader
        title={title}
        category={category}
        inputShown={inputShown}
        setInputShown={setInputShown}
      />

      <TaskList
        columnCategory={category}
        inputShown={inputShown}
        setInputShown={setInputShown}
        placeholder={inputPlaceholder}
      />
    </article>
  );
};

export default Column;
