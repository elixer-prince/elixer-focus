import Column from "@/features/tasks/components/Column";
import TaskHeader from "@/features/tasks/components/TaskHeader";
import {} from // useSetTasks,
// useTasks,
"@/features/tasks/stores/tasks-store";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/store";
// import { move } from "@dnd-kit/helpers";
// import { DragDropProvider } from "@dnd-kit/react";

const Tasks = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  // const tasks = useTasks();
  // const setTasks = useSetTasks();

  // const handleDragEnd: Parameters<typeof DragDropProvider>[0]["onDragEnd"] = (
  //   event,
  // ) => {
  //   const nextTasks = move(tasks, event);
  //   setTasks(nextTasks);
  // };

  return (
    <div className="p-12">
      <TaskHeader />

      <div className="tasks-container mt-8 flex flex-col items-center gap-8">
        {/* <DragDropProvider onDragEnd={handleDragEnd}> */}
        <div className="tasks-row flex gap-8">
          <Column
            title="Urgent and Important (Do First)"
            category="urgent-important"
          />
          <Column
            title="Not Urgent but Important (Schedule)"
            category="not-urgent-important"
          />
        </div>
        <div className="tasks-row flex gap-8">
          <Column
            title="Urgent but Not Important (Delegate)"
            category="urgent-not-important"
          />
          <Column
            title="Not Urgent nor Important (Eliminate)"
            category="not-urgent-not-important"
          />
        </div>
        <Column title="Uncategorised" category="uncategorised" />
        {/* </DragDropProvider> */}
      </div>
    </div>
  );
};

export default Tasks;
