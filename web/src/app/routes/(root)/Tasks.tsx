import TaskList from "@/features/tasks/components/TaskList";
import { useAddTask } from "@/features/tasks/stores/tasks-store";
import usePageTitle from "@/hooks/usePageTitle";
import { useTimerRunning } from "@/stores/countdown-timer/store";

const Tasks = () => {
  const { updatePageTitle } = usePageTitle();
  const timerRunning = useTimerRunning();

  if (!timerRunning) updatePageTitle("Elixer Focus - Tasks");

  const addTask = useAddTask();

  return (
    <div className="p-12">
      <div>
        <h1 className="page-title mb-4 text-center text-4xl font-bold">
          My Tasks
        </h1>

        <input
          type="text"
          className="input placeholder:text-primary mx-auto block placeholder:italic"
          placeholder="Do the laundry..."
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addTask(event.currentTarget.value);
              event.currentTarget.value = "";
            }
          }}
        />
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="flex gap-8">
          <TaskList title="Urgent and Important (Do Now)" />
          <TaskList title="Not Urgent but Important (Schedule)" />
        </div>
        <div className="flex gap-8">
          <TaskList title="Urgent but Not Important (Limit/Delegate)" />
          <TaskList title="Not Urgent nor Important (Delete)" />
        </div>
      </div>
    </div>
  );
};

export default Tasks;
