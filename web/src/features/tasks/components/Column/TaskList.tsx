import NewTaskInput from "@/features/tasks/components/NewTaskInput";
import GhostTask from "@/features/tasks/components/Task/Ghost";
import Task from "@/features/tasks/components/Task/Index";
import { useTasks } from "@/stores";
import type {
  Task as TaskData,
  TaskCategory,
} from "@/features/tasks/types/task";
import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type CompletionTransition = {
  status: "pending" | "exiting";
  index: number;
  wasFocused: boolean;
};

interface TaskListProps {
  columnCategory: TaskCategory;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
  placeholder: string;
  isDragging?: boolean;
  isSortingDisabled?: boolean;
  tasks?: TaskData[];
  taskSurface?: "matrix" | "home";
  onTaskExitStart?: (id: string) => void;
  onTaskExitEnd?: (id: string, wasFocused: boolean) => void;
}

const TaskList = ({
  columnCategory,
  inputShown,
  setInputShown,
  placeholder,
  isDragging = false,
  isSortingDisabled = false,
  tasks: previewTasks,
  taskSurface = "home",
  onTaskExitStart,
  onTaskExitEnd,
}: TaskListProps) => {
  const allTasks = useTasks();
  const [completionTransitions, setCompletionTransitions] = useState<
    Map<string, CompletionTransition>
  >(() => new Map());
  const taskSource = previewTasks ?? allTasks;
  const activeTasks = taskSource.filter(
    (task) => task.category === columnCategory && !task.isCompleted,
  );
  const tasks = [...activeTasks];

  for (const [id, transition] of completionTransitions) {
    const task = allTasks.find((item) => item.id === id);
    if (
      !task ||
      !task.isCompleted ||
      task.category !== columnCategory ||
      tasks.some((item) => item.id === id)
    ) {
      continue;
    }
    tasks.splice(Math.min(transition.index, tasks.length), 0, task);
  }

  const handleCompletionStart = useCallback(
    (id: string, completed: boolean, wasFocused: boolean) => {
      if (!completed) return;
      const index = activeTasks.findIndex((task) => task.id === id);
      setCompletionTransitions((current) => {
        const next = new Map(current);
        next.set(id, {
          status: "pending",
          index: index < 0 ? activeTasks.length : index,
          wasFocused,
        });
        return next;
      });
      onTaskExitStart?.(id);
    },
    [activeTasks, onTaskExitStart],
  );

  const handleCompletionResult = useCallback(
    (id: string, completed: boolean, succeeded: boolean) => {
      if (!completed) return;
      if (succeeded) {
        setCompletionTransitions((current) => {
          const transition = current.get(id);
          if (!transition) return current;
          const next = new Map(current);
          next.set(id, { ...transition, status: "exiting" });
          return next;
        });
        return;
      }

      onTaskExitEnd?.(id, false);
      setCompletionTransitions((current) => {
        if (!current.has(id)) return current;
        const next = new Map(current);
        next.delete(id);
        return next;
      });
    },
    [onTaskExitEnd],
  );

  const handleExitAnimationEnd = useCallback(
    (id: string) => {
      const transition = completionTransitions.get(id);
      if (!transition) return;
      onTaskExitEnd?.(id, transition.wasFocused);
      setCompletionTransitions((current) => {
        if (!current.has(id)) return current;
        const next = new Map(current);
        next.delete(id);
        return next;
      });
    },
    [completionTransitions, onTaskExitEnd],
  );

  useEffect(() => {
    const interrupted = [...completionTransitions].filter(
      ([id, transition]) => {
        const task = allTasks.find((item) => item.id === id);
        return transition.status === "exiting" && (!task || !task.isCompleted);
      },
    );
    if (interrupted.length === 0) return;

    interrupted.forEach(([id]) => onTaskExitEnd?.(id, false));
    setCompletionTransitions((current) => {
      const next = new Map(current);
      interrupted.forEach(([id]) => next.delete(id));
      return next;
    });
  }, [allTasks, completionTransitions, onTaskExitEnd]);

  return (
    <ul
      data-task-list={taskSurface}
      tabIndex={-1}
      className="tasks-container__task-list focus-visible:outline-primary flex flex-col gap-4 overflow-auto pt-1 pr-1 pb-4 pl-4 focus-visible:outline-2 focus-visible:outline-offset-2"
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
            isSortingDisabled={isSortingDisabled}
            taskSurface={taskSurface}
            completionTransition={{
              status: completionTransitions.get(id)?.status,
              onStart: handleCompletionStart,
              onResult: handleCompletionResult,
              onExitAnimationEnd: handleExitAnimationEnd,
            }}
          />
        ),
      )}
    </ul>
  );
};

export default TaskList;
